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
const { 
  addUser, 
  removeUser, 
  getUser, 
  getRoomUsers } = require("./entity");


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

 /////video call //////

io.on('profile:verificatioin', (socket) => {
  console.log('A user connected');
  
  // Handle disconnects (optional)
  socket.on('profile:end', () => {
    console.log('A user disconnected');
  });
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});
/////////END OF VIDEO CALL //////

//////// START OF CHAT //////////

io.on('connect',(socket) => {
  

  socket.on('join',({user,room},callback) => {
    console.log(user,room,'this is the room and userrs')
      const {response , error} = addUser({id: socket.id , user:user, room: room})

      console.log(response)

      if(error) {
        callback(error)
        return;
      }
      socket.join(response.room);
      socket.emit('message', { user: 'admin' , text: `Welcome ${response.user} ` });
      socket.broadcast.to(response.room).emit('message', { user: 'admin', text : `${response.user} has joined` })

      io.to(response.room).emit('roomMembers', getRoomUsers(response.room))
  })

  socket.on('sendMessage',(message,callback) => {


      const user = getUser(socket.id)
      io.to(user.room).emit('message', { user: user.user, text: message });
    
      callback()
    

      
  })

  socket.on('disconnects',() => {
    console.log("User disconnected");
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message',{ user: 'admin', text : `${user.user} has left` })
    }
  })
})

//////// END OF CHAT  //////////

////////MESSAGE //////////

io.on("connection", (socket) => {
  socket.on("listMessages", async (data) => {
    try {
      const { bookingId } = data;
      // Retrieve messages from MongoDB
      const messages = await messageModel.findOne({ bookingId: bookingId });

      // Emit the messages to the client
      socket.emit("messageList", messages);
    } catch (err) {
      console.error(err);
    }
  });
  socket.on("addMessage", async (data) => {
    try {
      const { bookingId, userId,partnerId, message, currentUserId } = data;
      const messageExist = await messageModel.findOne({ bookingId: bookingId });

      const user = await User.findOne({_id:currentUserId});
      if (user) {
        var userName = user.name;
      }

      const partner = await Partner.findOne({_id:currentUserId});
      if (partner) {
        var userName = partner.name;
      }

      if (messageExist) {
        const newMessage = {
          text: message,
          sender: currentUserId, 
          userName: userName,
        };

        const updateResult = await messageModel.updateOne(
          { bookingId: bookingId },
          {
            $push: {
              messages: newMessage,
            },
          }
        );
        // console.log(updateResult, "---------updateResult----------");
      } else {
        const newMessage = new messageModel({
          bookingId:new ObjectId(bookingId), // Replace with the actual Booking ID
          userId:new ObjectId(userId), // Replace with the actual User ID
          partnerId:new ObjectId(partnerId), // Replace with the actual Vendor ID
          // room:roomName,
          messages: [
            {
              text: message,
              sender: currentUserId, // Replace with the sender's ID
              userName: userName,
            },
            // Add more messages as needed
          ],
        });
        console.log(newMessage,"--new Message");

        newMessage
          .save()
          .then((savedMessage) => {
            console.log("Message saved:", savedMessage);
            // Handle the success case
          })
          .catch((error) => {
            console.error("Error saving message:", error);
            // Handle the error case
          });
      }
      // Emit the "messageAdded" event to all connected sockets
      io.emit("messageAdded");
    } catch (err) {
      console.error(err);
    }

  });
});

//////////END MESSAGE /////

server.listen(PORT, () => {
  console.log(`Server is started at Port no: ${PORT}`);
});
