# Stage 1: Build the application
FROM node as builder

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json package-lock.json ./

# Copy all files
RUN npm install
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create a development image
FROM node:14-slim

ENV NODE_ENV development
WORKDIR /usr/src/app

# Copy the built artifacts from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port
EXPOSE 3000

CMD [ "node", "dist/index.js" ]
