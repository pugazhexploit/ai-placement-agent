#!/bin/bash
# daily-commit.sh — appends a log line to README.md, commits, and pushes
# Run this up to 20 times/day. Each run = one clean README-only push.

REPO_DIR="/c/Users/acer/Downloads/swfitfinal"
COUNTER_FILE="$REPO_DIR/.daily-counter"
README="$REPO_DIR/README.md"
TODAY=$(date '+%Y-%m-%d')
TIME=$(date '+%H:%M')

cd "$REPO_DIR" || exit 1

# Reset counter if it's a new day
if [ -f "$COUNTER_FILE" ]; then
  LAST_DATE=$(head -1 "$COUNTER_FILE")
  if [ "$LAST_DATE" != "$TODAY" ]; then
    echo "$TODAY" > "$COUNTER_FILE"
    echo "1" >> "$COUNTER_FILE"
  fi
else
  echo "$TODAY" > "$COUNTER_FILE"
  echo "1" >> "$COUNTER_FILE"
fi

COUNT=$(tail -1 "$COUNTER_FILE")
NEXT=$((COUNT + 1))
echo "$NEXT" >> "$COUNTER_FILE"

# Append a timestamped activity line to README.md
echo "" >> "$README"
echo "- **${TODAY} ${TIME}** — Daily push #${COUNT}" >> "$README"

git add README.md
git commit -m "docs: daily push #${COUNT} (${TODAY} ${TIME})"
git push origin main

echo "Pushed: daily push #${COUNT} at ${TODAY} ${TIME}"
