#!/bin/zsh
# Double-click to make the CV as a PDF from local/cv-seed.json (see scripts/cv-pdf.mjs). Pass --lang vi for the Vietnamese CV.
cd "$(dirname "$0")/.." || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
npm run --silent cv:pdf -- "$@"
code=$?
[ $code -ne 0 ] && read -k 1 "?The PDF was not made. Press any key to close."
exit $code
