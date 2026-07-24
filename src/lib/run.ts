import type { BuildCode } from "@/lib/types";

/** Immutable state transition behind the Run It Back button. */
export function nextAttempt(build: BuildCode): BuildCode {
  return { ...build, picks: [...build.picks], attempt: build.attempt + 1 };
}
