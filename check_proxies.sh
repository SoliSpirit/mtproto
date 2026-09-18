#!/bin/bash

INPUT="all_proxies.txt"
OUTPUT="available_proxies.txt"
CONCURRENCY=50

if [[ ! -f "$INPUT" ]]; then
    echo "Error: file $INPUT not found." >&2
    exit 1
fi

> "$OUTPUT"

check_one() {
    local line="$1"
    [[ -z "$line" ]] && return 0

    local server port
    server=$(echo "$line" | sed -n 's/.*server=\([^&]*\).*/\1/p')
    port=$(echo "$line"   | sed -n 's/.*port=\([^&]*\).*/\1/p')

    if [[ -z "$server" || -z "$port" ]]; then
        echo "Warning: failed to parse line: $line" >&2
        return 0
    fi

    if timeout 5 bash -c "echo >/dev/tcp/$server/$port" 2>/dev/null; then
        echo "Available: $server:$port" >&2
        echo "$line"
    else
        echo "Unavailable: $server:$port" >&2
    fi
}
export -f check_one

xargs -a "$INPUT" -d '\n' -P "$CONCURRENCY" -I {} \
    bash -c 'check_one "$@"' _ {} > "$OUTPUT"

echo "Done. Working proxies written to $OUTPUT."
echo "Proxy list:"
cat "$OUTPUT"
