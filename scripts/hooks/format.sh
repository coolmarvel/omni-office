#!/bin/bash
# PostToolUse hook: Rust 및 프론트엔드 코드 자동 포맷팅
set -euo pipefail

# Rust 코드 포맷팅
if [ -d "src-tauri" ] && command -v cargo &>/dev/null; then
  (cd src-tauri && cargo fmt --all 2>/dev/null || true)
fi

# 프론트엔드(TypeScript/React) 코드 포맷팅
if command -v npx &>/dev/null && [ -f "package.json" ]; then
  npx prettier --write "src/**/*.{ts,tsx,css,json}" 2>/dev/null || true
fi

exit 0
