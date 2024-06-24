# Stage 1: Build the application
FROM node

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package.json ./

# Copy all files
RUN npm install
RUN npm install pm2 -g
COPY . .

# Build the application
RUN npm run build

ENV NODE_ENV production
WORKDIR ./dist

# Expose the port
EXPOSE 3000

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
