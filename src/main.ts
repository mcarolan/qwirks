import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const port = process.env.PORT ?? 3000;

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("./dist"));

io.on("connection", (s) => {
  console.log("a user connected");
  s.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(port);
console.log(`listening on port ${port}`);
