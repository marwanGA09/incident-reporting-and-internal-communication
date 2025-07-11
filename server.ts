const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3333;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  console.log("SOMETHING");
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket: any) => {
    console.log("A user connected");
    // ...
  });

  httpServer
    .once("error", (err: any) => {
      console.log("ERROR OCCURRED");
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
