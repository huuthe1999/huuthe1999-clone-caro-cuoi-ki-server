const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./configs/database");
const mongoose = require("mongoose");
const path = require("path");

// CONFIG .env
require("dotenv").config();

// Import Routers
const authRouter = require("./routers/auth.router");
const adminRouter = require("./routers/admin.router");

// Connect to mongo DB
connectDB();

//Middleware
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Repo for Caro Online Web App");
});

// Route Middleware
app.use("/api/user", authRouter);
app.use("/api/admin", adminRouter);

//Page not found
app.use((req, res) => {
  res.status(404).json({ message: "Page Not Found" });
});

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static('client/build'));
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//   })
// }
// Run app
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log("Server is running!");
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//Socket IO
const listUserOnline = require("./object/listUserOnline");

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    listUserOnline.push(socket.id, username);
    io.emit("new_connect", listUserOnline.getAll());
  });

  socket.on("disconnect", () => {
    listUserOnline.remove(socket.id);
    io.emit("new_connect", listUserOnline.getAll());
  });
});
