# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments (optional - will use runtime config if not provided)
ARG VITE_API_URL
ARG VITE_IDENTITY_URL

# Set as env vars for build process
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_IDENTITY_URL=$VITE_IDENTITY_URL

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production

# Build arguments for runtime config
ARG VITE_API_URL
ARG VITE_IDENTITY_URL

# Set as env vars
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_IDENTITY_URL=$VITE_IDENTITY_URL

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy config generation script
COPY generate-config.sh /docker-entrypoint.d/50-generate-config.sh
RUN chmod +x /docker-entrypoint.d/50-generate-config.sh

# Expose port 80
EXPOSE 80

# Start nginx (config will be generated automatically by entrypoint)
CMD ["nginx", "-g", "daemon off;"]
