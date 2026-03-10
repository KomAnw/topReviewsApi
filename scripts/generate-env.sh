#!/usr/bin/env bash

set -e

if [ -f ".env" ]; then
  echo ".env already exists, nothing to do."
  exit 0
fi

if [ ! -f ".env.example" ]; then
  echo "Error: .env.example not found in project root."
  exit 1
fi

cp .env.example .env
echo "Created .env from .env.example."

