#!/usr/bin/env python3
"""Generate full franchise-decade player pools from historical NBA box scores.

Source dataset (CC0):
https://www.kaggle.com/datasets/eoinamoore/historical-nba-data-and-player-box-scores

Usage:
  python3 scripts/generate_decade_rosters.py /path/to/archive.zip

The generated players are append-only supplements. Hand-authored era players
stay first in every bucket so published v5 player indices remain stable.
"""

from __future__ import annotations

import csv
import io
import json
import math
import re
import sys
import unicodedata
import zipfile
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "src/data/eras/decade-rosters.generated.ts"

TEAM_IDS = {
    1610612737: "hawks",
    1610612738: "celtics",
    1610612739: "cavs",
    1610612741: "bulls",
    1610612742: "mavs",
    1610612743: "nuggets",
    1610612744: "warriors",
    1610612745: "rockets",
    1610612746: "clippers",
    1610612747: "lakers",
    1610612748: "heat",
    1610612749: "bucks",
    1610612750: "wolves",
    1610612751: "nets",
    1610612752: "knicks",
    1610612753: "magic",
    1610612754: "pacers",
    1610612755: "sixers",
    1610612756: "suns",
    1610612757: "blazers",
    1610612759: "spurs",
    1610612760: "thunder",
    1610612761: "raptors",
    1610612762: "jazz",
    1610612763: "grizzlies",
    1610612764: "wizards",
    1610612765: "pistons",
}

# These are the franchise-decade buckets currently published by v5. Keeping
# the target set explicit prevents a source refresh from silently adding or
# reordering encoded wheel buckets.
TARGETS = {
    "bucks": {1970, 2020},
    "wizards": {1970, 2000},
    "sixers": {1980, 2000, 2010},
    "celtics": {1980, 1990, 2000},
    "lakers": {1980, 2000},
    "hawks": {1980, 2010},
    "pistons": {1980, 2000, 2010},
    "blazers": {1990, 2000},
    "suns": {1990, 2000},
    "mavs": {1990, 2010},
    "knicks": {1990, 2010},
    "rockets": {1990, 2010},
    "pacers": {1990, 2000},
    "magic": {1990, 2000},
    "bulls": {1990, 2000, 2010},
    "thunder": {1990, 2010},
    "jazz": {1990, 2000},
    "raptors": {1990, 2010},
    "spurs": {1990, 2010},
    "clippers": {2000, 2010},
    "nets": {2000, 2010},
    "grizzlies": {2000, 2010},
    "nuggets": {2000, 2020},
    "wolves": {2000, 2010},
    "heat": {2000, 2010},
    "warriors": {2000, 2010},
    "cavs": {2010},
}

NUMERIC_FIELDS = (
    "numMinutes",
    "points",
    "assists",
    "blocks",
    "steals",
    "fieldGoalsAttempted",
    "fieldGoalsMade",
    "threePointersAttempted",
    "threePointersMade",
    "freeThrowsAttempted",
    "freeThrowsMade",
    "reboundsTotal",
    "turnovers",
)

DISPLAY_NAME_ALIASES = {
    # NBA's historical feed uses the legal surname; the app and player are
    # universally known by the single-name form already authored in v5.
    "Nene Hilario": "Nene",
}


def number(value: str | None) -> float:
    try:
        parsed = float(value or 0)
        return parsed if math.isfinite(parsed) else 0.0
    except ValueError:
        return 0.0


def season_decade(game_id: str) -> int | None:
    digits = str(game_id).strip().zfill(8)
    if len(digits) != 8 or not digits.isdigit():
        return None
    year = int(digits[1:3])
    start = 2000 + year if year <= 45 else 1900 + year
    return (start // 10) * 10


def clamp(value: float, low: int = 30, high: int = 96) -> int:
    return max(low, min(high, round(value)))


def slug(name: str) -> str:
    plain = "".join(
        char for char in unicodedata.normalize("NFD", name) if unicodedata.category(char) != "Mn"
    ).lower()
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", plain))


def pct(made: float, attempted: float, fallback: float = 0.0) -> float:
    return made / attempted if attempted else fallback


def ratings(total: dict[str, float], meta: dict[str, str]) -> list[int]:
    played = max(1.0, total["played"])
    ppg = total["points"] / played
    apg = total["assists"] / played
    rpg = total["reboundsTotal"] / played
    spg = total["steals"] / played
    bpg = total["blocks"] / played
    tpg = total["turnovers"] / played
    mpg = total["numMinutes"] / played
    fg = pct(total["fieldGoalsMade"], total["fieldGoalsAttempted"], 0.42)
    three = pct(total["threePointersMade"], total["threePointersAttempted"], 0.0)
    ft = pct(total["freeThrowsMade"], total["freeThrowsAttempted"], 0.68)
    threes = total["threePointersMade"] / played
    guard = meta.get("guard") == "1"
    forward = meta.get("forward") == "1"
    center = meta.get("center") == "1"

    jump = 34 + ft * 34 + min(4.0, threes) * 7 + (three - 0.30) * 20 + min(10, ppg * 0.25)
    handle = 45 + (13 if guard else 5 if forward else 0) + apg * 3.4 - tpg * 1.2 + min(8, ppg * 0.2)
    finish = 38 + fg * 52 + min(22, ppg * 0.9) + (4 if center else 2 if forward else 0)
    play = 35 + apg * 6.3 - tpg * 1.1 + (4 if guard else 0)
    defense = 40 + spg * 11 + bpg * 9 + rpg * 0.9 + (5 if center else 3 if forward else 0)
    athletic = 42 + spg * 6 + bpg * 7 + rpg * 0.8 + min(12, mpg * 0.3) + (4 if center or forward else 2)
    return [clamp(v) for v in (jump, handle, finish, play, defense, athletic)]


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: generate_decade_rosters.py /path/to/archive.zip")
    archive = Path(sys.argv[1]).resolve()
    if not archive.is_file():
        raise SystemExit(f"dataset archive not found: {archive}")

    with zipfile.ZipFile(archive) as zf:
        with io.TextIOWrapper(zf.open("Players.csv"), encoding="utf-8-sig", newline="") as handle:
            player_meta = {row["personId"]: row for row in csv.DictReader(handle)}

        aggregates: dict[tuple[str, int, str], dict[str, float | str]] = defaultdict(
            lambda: {"games": set(), "played": 0.0, **{field: 0.0 for field in NUMERIC_FIELDS}}
        )
        with io.TextIOWrapper(zf.open("PlayerStatistics.csv"), encoding="utf-8-sig", newline="") as handle:
            for row in csv.DictReader(handle):
                if row.get("gameType") != "Regular Season":
                    continue
                try:
                    franchise = TEAM_IDS.get(int(row.get("playerteamId") or 0))
                except ValueError:
                    continue
                if franchise is None:
                    continue
                decade = season_decade(row.get("gameId", ""))
                if decade not in TARGETS.get(franchise, set()):
                    continue
                person_id = row.get("personId", "")
                if not person_id:
                    continue
                agg = aggregates[(franchise, decade, person_id)]
                agg["firstName"] = row.get("firstName", "").strip()
                agg["lastName"] = row.get("lastName", "").strip()
                games = agg["games"]
                assert isinstance(games, set)
                games.add(row.get("gameId", ""))
                minutes = number(row.get("numMinutes"))
                if minutes > 0:
                    agg["played"] = float(agg["played"]) + 1
                    for field in NUMERIC_FIELDS:
                        agg[field] = float(agg[field]) + number(row.get(field))

    by_bucket: dict[str, list[dict[str, object]]] = defaultdict(list)
    for (franchise, decade, person_id), agg in aggregates.items():
        first = str(agg.get("firstName", ""))
        last = str(agg.get("lastName", ""))
        name = DISPLAY_NAME_ALIASES.get(f"{first} {last}".strip(), f"{first} {last}".strip())
        if not name:
            continue
        played = max(1.0, float(agg["played"]))
        games = len(agg["games"] if isinstance(agg["games"], set) else [])
        ppg = float(agg["points"]) / played
        rpg = float(agg["reboundsTotal"]) / played
        apg = float(agg["assists"]) / played
        line = f"{ppg:.1f} PPG · {rpg:.1f} RPG · {apg:.1f} APG"
        by_bucket[f"{franchise}:{decade}"].append(
            {
                "personId": int(person_id),
                "name": name,
                "line": line,
                "note": f"{games} game{'s' if games != 1 else ''} with {franchise.upper()} in the decade",
                "r": ratings(agg, player_meta.get(person_id, {})),
                "minutes": float(agg["numMinutes"]),
            }
        )

    lines = [
        'import type { EraPlayer } from "@/lib/types";',
        "",
        "/**",
        " * Full franchise-decade player supplements generated from the CC0 NBA",
        " * historical box-score dataset. Hand-authored players remain first; these",
        " * arrays only append missing people so published v5 indices stay stable.",
        " * Source snapshot: 2026-06-15.",
        " */",
        "export const DECADE_ROSTER_SUPPLEMENTS: Record<string, EraPlayer[]> = {",
    ]
    for key in sorted(by_bucket):
        franchise, decade_text = key.split(":")
        decade = int(decade_text)
        players = sorted(by_bucket[key], key=lambda item: (-float(item["minutes"]), str(item["name"])))
        lines.append(f"  {json.dumps(key)}: [")
        for item in players:
            person = slug(str(item["name"]))
            payload = {
                "id": f"{franchise}-{decade}s:{person}",
                "person": person,
                "name": item["name"],
                "line": item["line"],
                "note": item["note"],
                "r": item["r"],
            }
            lines.append(f"    {json.dumps(payload, ensure_ascii=False, separators=(',', ':'))},")
        lines.append("  ],")
    lines.extend(["};", ""])
    OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {OUTPUT} ({sum(len(players) for players in by_bucket.values())} player-bucket rows)")


if __name__ == "__main__":
    main()
