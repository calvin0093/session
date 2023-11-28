const { User, Post, Comment, Like, Reply, LikeReply, Conversation } = require("../models");
const bcrypt = require("bcryptjs");
const path = require("path")
const express = require("express");
const { smtp } = require("../utils/nodemail");
const {Op} = require("sequelize")

const app = express()
app.use(express.static("public"))




exports.Signup = async (request, response) => {
  try {
    const { email, password } = request.body;

    //generate hash salt for password
    const salt = await bcrypt.genSalt(12);

    //generate the hashed version of users password
    const hashed_password = await bcrypt.hash(password, salt);

    const user = await User.create({ email, password: hashed_password });
    if (user) {
      response.redirect("/"),
        response.status(201).json({ message: "new user created!" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.HomePage = async (request, response) => {
  console.log(request);
  if (!request.user) {
    return response.redirect("/");
  }
  const page = parseInt(request.query.page);
  if (!Number.isInteger(page)) {
    return response.status(401).json({ message: "params is integer" })
  }
  const limit = 3;
  const offset = (page - 1) * limit
  const countPost = await Post.findAndCountAll();
  const countPage = Math.ceil(countPost.count / limit);
  const listPosts = await Post.findAll({
    offset,
    limit,
    include: User,
    order: [['createdAt', 'DESC']]
  });

  const userPost = listPosts.map((post) => post.user)
  const getConversation1 = await Conversation.findAll({ where: { user1: Person } })
  const getConversation2 = await Conversation.findAll({ where: { user2: Person } })
  const getConversation = getConversation1.concat(getConversation2)

  const Posts = await Post.findAll({include: [Comment]})
  const arrComment = []
  const arrReply = []
  Posts.forEach(post=>{
    post.comments.forEach(comment=>{
      arrComment.push(comment)
    })
  })
  console.log(arrComment);
  // console.log(arrReply);
  response.render("index", {
    sessionID: request.sessionID,
    // sessionExpireTime: new Date(req.session.cookie.expires) - new Date(),
    isAuthenticated: request.isAuthenticated(),
    user: request.user,
    userPost: userPost,
    listPosts: listPosts,
    countPage: countPage,
    getConversation: getConversation
  });

};

exports.LoginPage = async (request, response) => {
  response.render("auth/login");
};

exports.registerPage = async (request, response) => {
  request.render("auth/register");
};

exports.Logout = (request, response) => {
  request.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    response.redirect("/");
  });
};

exports.PostPage = async (request, response) => {
  response.render("post", {
    user: request.user,

  })
}
exports.CreatePost = async (request, response) => {
  const imageArr = []
  const image = request.files?.image;
  const { title, content } = request.body;
  const userId = request.user.id;

  if (Array.isArray(image)) {
    await image.forEach((image) => {
      imageArr.push(`/upload/${image.name}`)
    })
    for (let i = 0; i < image.length; i++) {
      image[i].mv(path.resolve("public/upload", image[i].name))
    }
  } else if (image == undefined) {
    console.log("break");
  } else {
    imageArr.push(`/upload/${image?.name}`)
    image?.mv(path.resolve("public/upload", image?.name))
  }

  try {
    const post = await Post.create({ title: title, content: content, image: imageArr, userId: userId })
    if (post) {
      response.redirect("/home");
      response.status(302);
    }
  } catch (error) {
    console.log(error);
  }
}



exports.ProfilePage = async (request, response) => {
  const getPostUser = await Post.findAll({ where: { userId: request.user.id } })
  response.render("profile", {
    user: request.user,
    getPostUser
  })
}

exports.DetailPost = async (request, response) => {
  try {
    const detailPost = await Post.findByPk(request.params.id, { include: User })
    const comments = await Comment.findAll({ where: { postId: request.params.id }, include: [{ model: User }, { model: Like }, { model: Reply, include: { model: LikeReply } }] })
    const count = await Comment.findAndCountAll({ where: { postId: request.params.id }, include: Reply })
    const arrayReplys = []
    count.rows.forEach((reps) => {
      reps.replys.forEach((rep) => {
        arrayReplys.push(rep)
      })
    })
    const totalComment = arrayReplys.length + comments.length
    response.render("detailPost", {
      detailPost,
      comments,
      totalComment,
      user: request.user
    })
  } catch (error) {
    console.log(error);
  }
}




exports.SubmitNewPassword = async (request, response) => {
  try {
    const id = request.user.id
    const { newpassword, confirm } = await request.body;
    if (newpassword != confirm) {
      return response.json("pass word fail")
    }
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(newpassword, salt)
    const user = await User.update({
      password: newPassword
    },
      { where: { id } })
    setTimeout(function () {
      response.redirect("/home")
    }, 3000);
  } catch (error) {
    console.log(error);
  }
}
exports.ChangePassword = (request, response) => {
  response.render('change', {
    user: request.user
  })
}


exports.GetEmail = (request, response) => {
  const email = Object.keys(request.body)
  smtp.sendMail({
    from: process.env.USERMAIL,
    to: email,
    subject: "Accout test",
    text: `Email address: abc@gmail.com, Password: 123`
  }).then(() => response.status(200).json(email))
    .catch(() => response.status(500).json({ success: false, message: `error mail` }))
}

exports.changeComment = async (request, response) => {
  await Comment.update({ content: request.body.content }, { where: { id: request.body.idComment } })
  response.send({ redirect: `/detailpost/${request.body.postId}` })
}

exports.getUser = async (request, response) => {
  const dataUser = request.user.email
  response.json(dataUser)
}

exports.getConversation = async (request, response) => {
  const getConversation1 = await Conversation.findAll({ where: { user1: Person } })
  const getConversation2 = await Conversation.findAll({ where: { user2: Person } })
  const getConversation = getConversation1.concat(getConversation2)
  response.json(getConversation)
}

exports.getPeopleMess = async (request, response) => {
  const getPeopleMess = await User.findAll({ where: { email: { [Op.substring]: `%${request.body.data}%` } } })
  const users = []
  getPeopleMess.forEach((email)=>{
    users.push(email.email)
  })
  console.log(users);
  response.json(users)
}

exports.getPostRecommend = async(request,response)=>{
  const getPostRecommend = await Post.findAll({where: {title: {[Op.substring]: `%${request.body.data}`}}})
  response.json(getPostRecommend)
}






