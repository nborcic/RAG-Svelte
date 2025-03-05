# Stage 1: Build the app
FROM node:20-slim AS builder
WORKDIR /app

# Clean up previous node_modules and package-lock.json, if any
RUN rm -rf node_modules package-lock.json

# Copy package files and install dependencies (all inside the Docker container)
COPY package.json ./
COPY package-lock.json ./
RUN npm install --no-optional --legacy-peer-deps

# Copy the rest of the app and build it
COPY . .
RUN npm run build

# Stage 2: Setup for production
FROM node:18-alpine
WORKDIR /app

# Clean up previous node_modules and package-lock.json, if any
RUN rm -rf node_modules package-lock.json

# Copy the build output from the builder stage
COPY --from=builder /app/.svelte-kit /app/.svelte-kit
COPY package.json ./
COPY package-lock.json ./
RUN npm install --only=production --omit=optional --legacy-peer-deps

# Expose the port and start the app
EXPOSE 3000
CMD ["npm", "run", "preview"]
