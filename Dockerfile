# Stage 1: Build the application
FROM node

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package.json package-lock.json ./

# Copy all files
RUN npm install
COPY . .

# Build the application
RUN npm run build

ENV NODE_ENV local
WORKDIR ./dist

# Expose the port
EXPOSE 3000

CMD ["npm", "run", "dev:local"]
