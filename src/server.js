const express = require("express");
require("dotenv").config();
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const { createClient } = require("redis");
const passport = require("passport");
const router = require("../src/routers");
const { passportConfig } = require("./utils/passport");
const fileUpload = require("express-fileupload")
const paginate = require("express-paginate")
const axios = require("axios")
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
const $ = require("jquery")(window);
const app = express();
const server = require('http').createServer(app);
const { Server } = require("socket.io");

const { Comment, User, Post, Like, Reply, LikeReply, Conversation, Message } = require("./models");
const io = new Server(server, {
  cors: {
    origin: "*"
  }
})




const PORT = process.env.PORT;


//app middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"))
app.use(fileUpload())
app.use(paginate.middleware(10, 50))


let redisClient = createClient()
redisClient.connect().catch(console.error)
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "session"
})

//Configure session middleware
const SESSION_SECRET = process.env.SESSION_SECRET || "secret-key";


app.use(
  session({
    store: redisStore,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // if true only transmit cookie over https
      httpOnly: false, // if true prevent client side JS from reading the cookie
      // maxAge: 1000 * 60 * 30, // session max age in miliseconds
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());


passportConfig();
require("./utils/ppgoogle")(passport)




global.LoggedIn = null;
global.Person = null;
app.use("*", (request, response, next) => {
  Person = request?.user?.email
  LoggedIn = request?.user?.id;
  next()
})

//SOCKET IO
io.on('connection', socket => {
  const url = socket.handshake.headers.referer;
  const parts = url.split("/");
  var room;
  // CRAETE COMMENT
  socket.on('dataFromClient', async data => {
    const comment = await Comment.create({ content: data, userId: LoggedIn, postId: parts[4] })
    const commentUser = await Comment.findOne({ where: { id: comment.id }, include: User })
    const countComment = await Comment.findAndCountAll({ where: { postId: parts[4] } })
    io.emit("dataFromServer", [commentUser, countComment])
  });

  //DELETE COMMENT
  socket.on("delete", async id => {
    const delComment = await Comment.destroy({ where: { id: id } })
    io.emit("dataFromServer", delComment)
  })

  // DELETE REPLY
  socket.on("deleteReply", async id => {
    const delReply = await Reply.destroy({ where: { id: id } })
    io.emit("dataFromServer", delReply)
  })

  // FIX COMMENT
  socket.on('idComment', async id => {
    const fixComment = await Comment.findOne({ where: { id: id }, include: [User, Post] });
    io.emit("fixComment", fixComment)
  })


  // FIX REPLY
  socket.on('idReply', async id => {
    const fixReply = await Reply.findOne({ where: { id: id } });
    io.emit("dataFromServer1", fixReply)
    socket.on("changeReply", async data => {
      console.log(data);
      const updateContentRep = await Reply.update({ content: data.newContent }, { where: { id: data.idReply } })
      const getReply = await Reply.findOne({ where: { id: data.idReply } })
      io.emit("dataFromServer2", getReply)
    })
  })

  /// LIKE
  socket.on("like", async data => {

    const datalike = await Like.findOne({ where: { commentId: data[0], userId: LoggedIn } })
    if (data[1] === 1 && !datalike) {
      await Like.create({ numberLike: data[1], userId: LoggedIn, commentId: data[0], person: Person })
    }
    else {
      await Like.destroy({ where: { userId: LoggedIn, commentId: data[0] } })
    }
    const like = await Like.findAndCountAll({ where: { commentId: data[0] } })
    io.emit("dataFromServer", like)
  })

  /// LIKE REPLY
  socket.on("likeReply", async data => {
    console.log(data);
    const dataLikeReply = await LikeReply.findOne({ where: { replyId: data[0] }, userId: LoggedIn })
    if (data[1] === 1 && !dataLikeReply) {
      await LikeReply.create({ numberLike: data[1], userId: LoggedIn, replyId: data[0], person: Person })
    }
    else {
      await LikeReply.destroy({ where: { userId: LoggedIn, replyId: data[0] } })
    }
    const like = await LikeReply.findAndCountAll({ where: { replyId: data[0] } })
    io.emit("dataFromServer", like)
  })

  /// PEOPLE LIKE
  socket.on("peopleLike", async id => {
    const peopleLike = await Like.findAll({ where: { commentId: id }, include: User })
    io.emit("dataFromServer", peopleLike)
  })


  /// PEOPLE REPLY
  socket.on("reply", async data => {
    const commentUser = await Comment.findOne({ where: { id: data.idComment }, include: User })
    const createReply = await Reply.create({ content: data.data, userId: LoggedIn, commentId: data.idComment, person: Person })
    io.emit("dataFromServer", { createReply, commentUser })
  })

  socket.on("join", async data => {
    const find1 = await Conversation.findOne({ where: { user1: data.userSend, user2: data.userGet } })
    const find2 = await Conversation.findOne({ where: { user2: data.userSend, user1: data.userGet } })
    if (!find1 && !find2) {
      const conversation = await Conversation.create({ user1: data.userSend, user2: data.userGet })
      room = conversation.id
    } else if (find1) {
      room = find1.id
    } else {
      room = find2.id
    }
    console.log(room);
    socket.join(room)
    const getAllMess = await Message.findAll({ where: { conversationId: room }, include:User })
    io.to(room).emit("getAllMess", getAllMess)
    return room
  })
  socket.on("message", async function (data) {
    console.log(LoggedIn);
    const createMess = await Message.create({ content: data, conversationId: room, userId: LoggedIn })
    io.to(room).emit("repmess", createMess)
  })


  socket.on('disconnect', () => { console.log("user disconnect"); });
});


// socketIo

// const  SocketController  = require("./utils/socketIo")

// const socketController = new SocketController(io)

// io.on("connection", socketController.onConnection);
// io.on("dataFromClient",socketController.onMessage)
// io.emit("dataFromServer", socketController.onMessage)



//Router middleware
app.use(router);



server.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
