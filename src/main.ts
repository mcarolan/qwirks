import express from "express";
import http from "http";
import { Server } from "socket.io";
import { generateUsername } from "unique-username-generator";

const app = express();
const port = process.env.PORT ?? 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.static("./dist"));

const usernames = new Map<string, string>();

function randomUsername(): string {
  return generateUsername(" ");
}

io.on("connection", (s) => {
  var userId: string | undefined;
  console.log("a user connected");
  s.on("user.identity", (uid, uname) => {
    console.log(`user id is ${uid}, username ${uname}`);
    userId = uid;

    if (!usernames.has(uid)) {
      usernames.set(uid, randomUsername());
    }

    s.emit("user.username", usernames.get(uid));
    io.emit("user.list", [...usernames.entries()]);
  });
  s.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(port);
console.log(`listening on port ${port}`);
