# [proj.docker.prof.1.1] Base image: node:22-alpine (lightweight Node.js runtime)
FROM node:22-alpine AS build

# [proj.docker.prof.1.2] Working directory: /app
WORKDIR /app

# [proj.docker.prof.1.3] Copy package.json into build stage
COPY package.json ./

# [proj.docker.prof.1.4] Run npm install to install dependencies
RUN npm install

# [proj.docker.prof.1.5] Copy source directory src/ into build stage
COPY src ./src
COPY tsconfig.json ./

# [proj.docker.prof.1.6] Run npx tsc to compile TypeScript to dist/
RUN npx tsc

# [proj.docker.prof.1.7] Base image: node:22-alpine (same as build stage)
FROM node:22-alpine AS production

# [proj.docker.prof.1.8] Working directory: /app
WORKDIR /app

# [proj.docker.prof.1.9] Copy --from=build dist/ and node_modules/ from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# [proj.docker.prof.1.10] Expose ports 7700 (WebSocket) and 7701 (HTTP) in container
EXPOSE 7700 7701

# [proj.docker.prof.1.11] Default command: node dist/server.js (start profiler server)
# [proj.docker.prof.1.12] Production stage should not include TypeScript compiler or build tools
CMD ["node", "dist/server.js"]
