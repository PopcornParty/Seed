#!/usr/bin/env bash
set -euo pipefail
g++ -O3 -std=c++17 -o /tmp/seed-cli "$(dirname "$0")/../native/cpp/cli.cpp"
echo "=== native village r=1500 x 50000 ==="
/tmp/seed-cli --bench --count 50000 --need village:1500
echo "=== native village r=500 + portal r=800 x 20000 ==="
/tmp/seed-cli --count 20000 --need village:500 --need ruined_portal:800 --top 5
