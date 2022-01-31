import express from "express";
import http from "http";
import { Server } from "socket.io";
import { UserWithStatus, User, OnlineStatus } from "./User";

const app = express();
const port = process.env.PORT ?? 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const users = new Map<string, UserWithStatus>();

io.on("connection", (s) => {
  var userId: string | undefined;
  console.log("a user connected");

  s.on("user.identity", (user: User) => {
    console.log(`user is ${JSON.stringify(user)}`);
    userId = user.userId;

    users.set(userId, { ...user, onlineStatus: OnlineStatus.online });

    io.emit("user.list", [...users.entries()]);
  });

  s.on("disconnect", () => {
    if (userId) {
      const user = users.get(userId);

      if (user) {
        console.log(`${user} disconnected`);
        users.set(userId, { ...user, onlineStatus: OnlineStatus.offline });
        io.emit("user.list", [...users.entries()]);
      }
    }
  });
});

server.listen(port);
console.log(`listening on port ${port}`);
