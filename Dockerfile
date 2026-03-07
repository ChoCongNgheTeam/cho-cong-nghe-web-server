FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

COPY tsconfig.json ./

ENV TSCONFIG_PATHS_TSCONFIG=tsconfig.prod.json

CMD ["npm", "start"]