#!/usr/bin/env bash
# PostToolUse hook (Edit | MultiEdit | Write): run fallow after a code edit and
# hand any findings back to the agent so it fixes them in the same session.
#
#   exit 0 — nothing to report (or fallow is missing / could not run: never blocks work)
#   exit 2 — findings: stderr is shown to the agent (the edit itself already happened)
#
# Uses the project's pinned fallow (node_modules/.bin/fallow). It never downloads
# anything: install it once with `npm install --save-dev fallow`.
# Override the binary with FALLOW_BIN (used by tests).
set -u

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$project_dir" || exit 0

# Which file was edited? (hook input is JSON on stdin; node is always present here)
file_path="$(node -e '
  let s = "";
  process.stdin.on("data", (d) => (s += d)).on("end", () => {
    try { process.stdout.write(JSON.parse(s).tool_input?.file_path ?? ""); } catch {}
  });
' 2>/dev/null)"

# Only code that fallow analyses; skip generated, vendored and read-only paths.
case "$file_path" in
  */node_modules/*|*/.next/*|*/docs/design-system/*|*/types/*) exit 0 ;;
  *.ts|*.tsx|*.mts|*.cts|*.js|*.jsx|*.mjs|*.cjs|*.css|*/package.json) ;;
  *) exit 0 ;;
esac

fallow_bin="${FALLOW_BIN:-$project_dir/node_modules/.bin/fallow}"
if [ ! -x "$fallow_bin" ]; then
  echo "fallow hook: fallow is not installed — run 'npm install --save-dev fallow'. Skipping." >&2
  exit 0
fi

output="$("$fallow_bin" --format compact --quiet --fail-on-issues 2>&1)"
status=$?

case "$status" in
  0) exit 0 ;;
  1)
    {
      echo "fallow found issues after editing ${file_path#"$project_dir"/}."
      echo "Fix the ones your change caused (or that are clearly safe to fix) and re-run 'npx fallow' to confirm."
      echo "If a finding is intentional, suppress it with a 'fallow-ignore' comment and say why."
      echo
      printf '%s\n' "$output" | head -c 8000
    } >&2
    exit 2
    ;;
  *)
    # Invalid config or execution error: report, but never block the agent.
    echo "fallow hook: fallow exited with $status (not a code finding):" >&2
    printf '%s\n' "$output" | head -c 2000 >&2
    exit 0
    ;;
esac
