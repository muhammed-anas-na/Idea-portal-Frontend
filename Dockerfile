# Stage 1 — Build Angular frontend
FROM node:22-alpine AS frontend
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps

COPY frontend/ ./
RUN npm run build -- --configuration production

# Stage 2 — Build TypeScript backend
FROM node:22-alpine AS backend-build
WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --legacy-peer-deps

COPY server/ ./
RUN npm run build

# Stage 3 — Runtime image
FROM node:22-alpine AS runtime
WORKDIR /app

# Install only production deps
COPY server/package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev && npm cache clean --force

# Copy compiled backend
COPY --from=backend-build /app/server/dist ./dist

# Copy Angular build output into server/public — Express static middleware serves this
COPY --from=frontend /app/frontend/dist/frontend/browser ./public

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["node", "dist/index.js"]