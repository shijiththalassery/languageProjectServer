require('dotenv').config();
const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors');
const PORT = 4002;
const MY_SECRET_KEY = process.env.MY_SECRET_KEY;
const session = require('express-session');
const router = require("./Routes/route");
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const { Server } = require('socket.io'); // Import Server from socket.io
const handlebars = require('handlebars')
const cookieParser = require('cookie-parser');  



app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(cookieParser())

app.use(session({
  secret: uuidv4(),
  saveUninitialized: true,
  cookie: {
    maxAge: 600000000,
  },
  resave: false
}));

require("./db/connection")

// Middleware
app.use(express.json());
app.use(cors());
app.use(router);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  }
});

// Attach 'io' to the 'app' object
app.io = io;

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Handle disconnects (optional)
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is started at Port no: ${PORT}`);
});
