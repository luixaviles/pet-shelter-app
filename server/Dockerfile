# ---- Base Stage ----
# Use a specific Node.js version for reproducibility.
# Alpine Linux is used for its small size.
FROM node:22.20.0-alpine AS base
WORKDIR /usr/src/app

# ---- Dependencies Stage ----
# This stage is dedicated to installing NPM dependencies.
# It's separated to leverage Docker's layer caching.
FROM base AS dependencies
COPY package.json package-lock.json* ./
# Install all dependencies, including devDependencies needed for the build
RUN npm install

# ---- Build Stage ----
# This stage compiles the TypeScript code into JavaScript.
FROM dependencies AS build
COPY . .
# Run the build script defined in package.json
# Increase memory for the build process to prevent out-of-memory errors
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# ---- Production Stage ----
# This is the final, lean production image.
FROM base AS production
ENV NODE_ENV=production

# Copy necessary files from previous stages
COPY package.json package-lock.json* ./

# Install pm2 globally
RUN npm install -g pm2@latest

# Install only production dependencies
RUN npm install --omit=dev

# Copy the compiled code from the build stage
COPY --from=build /usr/src/app/dist ./dist

# Copy JSON data
COPY --from=build /usr/src/app/data ./data

# Expose the port the app runs on
# This should be mapped to the host in the `docker run` command.
EXPOSE 3000

# The command to run the application using pm2-runtime.
# This ensures the app is managed and restarted correctly.
CMD ["pm2-runtime", "dist/server.js"] 
