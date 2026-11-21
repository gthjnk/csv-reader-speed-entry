# Slice CSV

[![make.fun bounty](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121)
[![Rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/GITHUB_OWNER/csv-reader-speed-entry/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121)
[![Reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/GITHUB_OWNER/csv-reader-speed-entry/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121)

A dependency-free CSV reader that scans delimiters and slices contiguous fields,
preserving the reference reader's recovery rules and error ordering for broken CSV.

Requires Node.js 22. The driver reads `/input/cases.json` and writes
`/output/answers.json`; for local runs, point the driver at existing directories:

```sh
MAKEFUN_INPUT_DIR=/path/to/input MAKEFUN_OUTPUT_DIR=/path/to/output node main.ts
node --test
```
