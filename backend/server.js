const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require( './middleware/errorMiddleware' );
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require("./routes/messageRoutes");



connectDB();
const app = express();
app.use(express.json());


app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);



//---------------deployment code---------------------

const __dirname1 = path.resolve();
if(process.env.NODE_EVN === "production"){
 app.use(express.static(path.join(__dirname1, "/frontend/build")));

 
 app.get("*", (req, res) =>
 res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
);

}else{
    app.get("/", (req,res) => {
        res.send("API is Running Successfully..!!");
    });
}




app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT,() =>{
    console.log(`server runing on port ${PORT}`);
});


const io = require('socket.io')(server,{
    pingTimeout:60000,
    cors:{
       Origin:"http://localhost:3000",
       methods: ["GET", "POST"]
    },
});

io.on("connection" , (socket) => {
console.log("Connected to socket.io");

socket.on("setup",(userData)=>{
    socket.join(userData._id);
    // console.log(userData._id);
    socket.emit("connected");
});

socket.on("join chat",(room) =>{
    socket.join(room);
    // console.log("user join room" + room);
});


socket.on("typing",(room) => socket.in(room).emit("typing"));
socket.on("stop typing",(room) => socket.in(room).emit("stop typing"));


socket.on("new message",(newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if(!chat.users) return console.log("chat.users not defined.");

    chat.users.forEach(user => {
       if(user._id == newMessageRecieved.sender._id) return;

       socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
});

socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
   
  
});


