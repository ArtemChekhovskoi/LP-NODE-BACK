# Stage 1: Build the application
FROM node

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package.json ./

# Copy all files
RUN npm install
COPY . .

# Build the application
RUN npm run build

ENV NODE_ENV production
WORKDIR ./dist

# Expose the port
EXPOSE 3000

CMD ["npm", "run", "start"]
