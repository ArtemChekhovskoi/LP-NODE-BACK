FROM node as builder

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy all files
RUN npm install --frozen-lockfile
COPY . .

# Install all dependencies
RUN npm build

FROM node:slim

ENV NODE_ENV development
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json ./
RUN npm install --development --frozen-lockfile

COPY --from=builder /usr/src/app/dist ./dist
# Expose the port
EXPOSE 3001

CMD [ "node", "dist/index.js" ]