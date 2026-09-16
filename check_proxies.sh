#!/bin/bash

# Input and output file names
INPUT="all_proxies.txt"
OUTPUT="available_proxies.txt"

# Clear the output file (or create an empty one)
> "$OUTPUT"

# Check whether the input file exists
if [[ ! -f "$INPUT" ]]; then
    echo "Error: file $INPUT not found." >&2
    exit 1
fi

# Read the file line by line
while IFS= read -r line; do
    # Skip empty lines
    [[ -z "$line" ]] && continue

    # Extract the server and port parameters using sed
    server=$(echo "$line" | sed -n 's/.*server=\([^&]*\).*/\1/p')
    port=$(echo "$line" | sed -n 's/.*port=\([^&]*\).*/\1/p')

    # If both parameters could not be extracted, skip the line
    if [[ -z "$server" || -z "$port" ]]; then
        echo "Warning: failed to parse line: $line" >&2
        continue
    fi

    # Check host and port availability via the built-in /dev/tcp (bash only)
    # Timeout: 5 seconds
    if timeout 5 bash -c "echo >/dev/tcp/$server/$port" 2>/dev/null; then
        echo "Available: $server:$port"
        echo "$line" >> "$OUTPUT"
    else
        echo "Unavailable: $server:$port"
    fi
done < "$INPUT"

echo "Done. Working proxies written to $OUTPUT."
echo "Proxy list:"
cat "$OUTPUT"
