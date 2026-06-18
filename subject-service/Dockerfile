FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p uploadDir
RUN chown -R node:node /usr/src/app
USER node
CMD ["node", "index.js"]
