# [proj.docker.dash.1.1] Base image: node:22-alpine (Node.js 22 on Alpine Linux)
FROM node:22-alpine AS build

# [proj.docker.dash.1.2] Working directory: /app
WORKDIR /app

# [proj.docker.dash.1.3] Copy package.json and install all dependencies (including dev dependencies)
COPY package.json ./
RUN npm install

# [proj.docker.dash.1.4] Copy full source tree including astro.config.ts, src/, and tsconfig.json
COPY . .

# [proj.docker.dash.1.5] Run astro build to statically generate site into dist/
RUN npm run build

# [proj.docker.dash.1.6] Base image: node:22-alpine
FROM node:22-alpine AS production

# [proj.docker.dash.1.7] Working directory: /app
WORKDIR /app

# [proj.docker.dash.1.8] Copy --from=build dist/ (compiled Astro output) into production stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# [proj.docker.dash.1.9] Expose port 4321 (Astro default development server port)
EXPOSE 4321

# [proj.docker.dash.1.10] Default command: node dist/server/entry.mjs (Astro's server entry point for SSR)
# [proj.docker.dash.1.11] Production stage includes only dist/ directory; no source or build tools
CMD ["node", "dist/server/entry.mjs"]
