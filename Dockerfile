FROM node:16

COPY server /app/server
COPY shared /app/shared
WORKDIR /app/shared
RUN npm install
WORKDIR /app/server
RUN npm install
COPY . . 

CMD ["node", "/app/server/out/server/src/main.js" ]
