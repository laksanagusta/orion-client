#!/bin/sh

# Generate config.js with environment variables
# This script runs during Docker build to embed build-time env vars into config.js

cat > /usr/share/nginx/html/config.js << EOF
// Runtime configuration
// Generated at build time: $(date)
// You can modify this file after deployment to change API URLs without rebuilding

window.APP_CONFIG = {
  API_URL: '${VITE_API_URL:-}',
  IDENTITY_URL: '${VITE_IDENTITY_URL:-}',
};
EOF

echo "✅ Generated config.js with:"
echo "   API_URL: ${VITE_API_URL:-(empty - will use same origin)}"
echo "   IDENTITY_URL: ${VITE_IDENTITY_URL:-(empty - will use same origin)}"
