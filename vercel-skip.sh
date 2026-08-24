#!/usr/bin/env bash

# Vercel "Ignored Build Step" script.
# Exit 0  -> build is SKIPPED
# Exit 1  -> build RUNS
# Allowed refs: main (production) and staging (preview)

ALLOWED_REFS=("main" "staging")

BRANCH="${VERCEL_GIT_COMMIT_REF:-}"
ENV="${VERCEL_ENV:-}"

if [[ "$ENV" == "production" ]]; then
  if [[ " ${ALLOWED_REFS[*]} " == *" $BRANCH "* ]]; then
    echo "Building production deploy for branch: $BRANCH"
    exit 1
  fi
  echo "Skipping production build for branch: $BRANCH"
  exit 0
fi

if [[ "$ENV" == "preview" && "$BRANCH" == "staging" ]]; then
  echo "Building preview deploy for branch: $BRANCH"
  exit 1
fi

echo "Skipping build for branch: $BRANCH (env: $ENV)"
exit 0
