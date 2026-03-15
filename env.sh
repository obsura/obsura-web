#!/bin/sh

# Overwrite config file directly (using > truncates and writes).
# We avoid using 'rm' because unprivileged users (nginx) cannot 
# remove files in root-owned directories, causing appending bugs.
echo "window._env_ = {" > /usr/share/nginx/html/env-config.js

# Add VITE_ variables to the window._env_ object safely
# If the variable exists, write it out
if [ -n "$VITE_API_BASE_URL" ]; then
    echo "  VITE_API_BASE_URL: \"$VITE_API_BASE_URL\"," >> /usr/share/nginx/html/env-config.js
fi

if [ -n "$VITE_API_ORIGIN" ]; then
    echo "  VITE_API_ORIGIN: \"$VITE_API_ORIGIN\"," >> /usr/share/nginx/html/env-config.js
fi

echo "};" >> /usr/share/nginx/html/env-config.js

exec "$@"
