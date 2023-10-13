FROM node as builder

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json package-lock.json ./

# Copy all files
RUN npm install
COPY . .

RUN npm run build

FROM node:slim

ENV NODE_ENV development
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
# Expose the port
EXPOSE 3001

CMD [ "node", "dist/index.js" ]