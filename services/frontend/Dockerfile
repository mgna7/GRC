# Multi-stage Dockerfile for React Frontend

# ============================================
# Development Stage
# ============================================
FROM node:20-alpine AS development

LABEL maintainer="ComplianceIQ Team"
LABEL service="frontend"
LABEL version="1.0.0"
LABEL stage="development"

WORKDIR /app

# Install dependencies first (for layer caching)
COPY services/frontend/package*.json ./

RUN npm install

# Copy application code
COPY services/frontend/index.html ./index.html
COPY services/frontend/src ./src
COPY services/frontend/tsconfig.json ./tsconfig.json
COPY services/frontend/tsconfig.node.json ./tsconfig.node.json
COPY services/frontend/vite.config.ts ./vite.config.ts

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start development server
CMD ["npm", "start"]

# ============================================
# Build Stage
# ============================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY services/frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY services/frontend/index.html ./index.html
COPY services/frontend/src ./src
COPY services/frontend/tsconfig.json ./tsconfig.json
COPY services/frontend/tsconfig.node.json ./tsconfig.node.json
COPY services/frontend/vite.config.ts ./vite.config.ts

# Build the application
RUN npm run build

# ============================================
# Production Stage
# ============================================
FROM nginx:1.25-alpine AS production

LABEL maintainer="ComplianceIQ Team"
LABEL service="frontend"
LABEL version="1.0.0"
LABEL stage="production"

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create basic nginx configuration
RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
