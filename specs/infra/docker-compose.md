**Type:** YAML Docker Compose Configuration
**Output:** docker-compose.yml

# Docker Compose Infrastructure

## Services Overview
[proj.docker.1.1] Three services: dashboard, profiler, and redis
[proj.docker.1.2] All services share traefik external network for reverse proxy routing
[proj.docker.1.3] Services communicate via internal Docker network (redis) and container hostnames

## Dashboard Service
[proj.docker.1.4] Service name: "dashboard"
[proj.docker.1.5] Build context: ./packages/dashboard (uses Dockerfile in that directory)
[proj.docker.1.6] Exposed port 4321 (Astro default port) mapped to host 4321
[proj.docker.1.7] Environment variable PROFILER_WS_URL=ws://profiler:7700 (WebSocket endpoint)
[proj.docker.1.8] Environment variable PROFILER_HTTP_URL=http://profiler:7701 (HTTP endpoint)
[proj.docker.1.9] Traefik labels: enable routing to code-heat.pow with entrypoint web

## Profiler Service
[proj.docker.1.10] Service name: "profiler"
[proj.docker.1.11] Build context: ./packages/profiler (uses Dockerfile in that directory)
[proj.docker.1.12] Expose port 7700 (WebSocket profiler server) mapped to host 7700
[proj.docker.1.13] Expose port 7701 (HTTP profiler API) mapped to host 7701
[proj.docker.1.14] Environment variable TARGET_HOST=host.docker.internal (connect to host for Node inspection)
[proj.docker.1.15] Environment variable TARGET_PORT=9229 (Node --inspect port)
[proj.docker.1.16] Environment variable REDIS_URL=redis://redis:6379 (Redis connection string)

## Redis Service
[proj.docker.1.17] Service name: "redis"
[proj.docker.1.18] Image: redis:7-alpine (lightweight Redis container)
[proj.docker.1.19] Port 6379 exposed internally for profiler connection

## Networking
[proj.docker.1.20] All services must connect to traefik external network (defined at root level)
[proj.docker.1.21] Networks definition: traefik is external: true
[proj.docker.1.22] Default bridge network used for inter-service communication