FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

EXPOSE 3000

CMD ["npm", "start", "--", "--host", "0.0.0.0"]
