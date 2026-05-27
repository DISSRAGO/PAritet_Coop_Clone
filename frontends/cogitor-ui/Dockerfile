FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY . /app

EXPOSE 3001

CMD ["npm", "start"]