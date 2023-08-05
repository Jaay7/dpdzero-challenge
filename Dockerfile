FROM node:18.14.2

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g prisma

COPY . .

EXPOSE 3300

CMD ["npm", "run", "dev"]