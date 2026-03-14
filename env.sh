#!/bin/sh

# Recreate config file
rm -rf /usr/share/nginx/html/env-config.js
touch /usr/share/nginx/html/env-config.js

# Add assignment 
echo "window._env_ = {" >> /usr/share/nginx/html/env-config.js

# Add VITE_ variables to the window._env_ object safely
# If the variable exists, write it out
if [ -n "$VITE_API_BASE_URL" ]; then
    echo "  VITE_API_BASE_URL: \"$VITE_API_BASE_URL\"," >> /usr/share/nginx/html/env-config.js
fi

if [ -n "$VITE_MOCK_MODE" ]; then
    echo "  VITE_MOCK_MODE: \"$VITE_MOCK_MODE\"," >> /usr/share/nginx/html/env-config.js
fi

echo "}" >> /usr/share/nginx/html/env-config.js
