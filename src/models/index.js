const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config()
const sequelize = new Sequelize({
  host: process.env.HOST,
  database: process.env.DATABASE,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  dialect: "mysql",
  "logging": false,
  "define": {
    "timestamps": false,
  }

});

// MODEL USER

exports.User = sequelize.define("users", {
  // Model attributes are defined here
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  }
});

/// MODEL POST


exports.Post = sequelize.define("posts", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,

  },
  title: {
    type: DataTypes.STRING,
  },
  content: {
    type: DataTypes.TEXT
  },
  image: {
    type: DataTypes.JSON
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: "users",
      key: "id"
    }
  },
}, {
  timestamps: true
})

//// MODEL COMMENT

exports.Comment = sequelize.define("comments", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: "users",
      key: "id"
    }
  },
  postId: {
    type: DataTypes.INTEGER,
    references:{
      model: "posts",
      key: "id"
    }
  }
}, {timestamps: true}
)

// MODEL LIKE

exports.Like = sequelize.define("likes", {
  id:{
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numberLike: {
    type:DataTypes.INTEGER,
  },
  person: {
    type:DataTypes.STRING
  },
  userId: {
    type:DataTypes.INTEGER,
    references:{
      model:"users",
      key:"id"
    }
  },
  commentId:{
    type:DataTypes.INTEGER,
    references: {
      model:"comments",
      key:"id"
    }
  },
},{timestamps: false})

exports.Reply = sequelize.define("replys", {
  id:{
    type:DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true
  },
  content:{
    type:DataTypes.STRING,
  },
  person:{
    type:DataTypes.STRING
  },
  userId:{
    type:DataTypes.INTEGER,
    references:{
      model:"users",
      key:"id"
    }
  },
  commentId:{
    type:DataTypes.INTEGER,
    references:{
      model:"comments",
      key:"id"
    }
  }
},{timestamps:true})

exports.LikeReply = sequelize.define("likeReplys", {
  id:{
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numberLike: {
    type:DataTypes.INTEGER,
  },
  person: {
    type:DataTypes.STRING
  },
  userId: {
    type:DataTypes.INTEGER,
    references:{
      model:"users",
      key:"id"
    }
  },
  replyId:{
    type:DataTypes.INTEGER,
    references: {
      model:"replys",
      key:"id"
    }
  },
},{timestamps: false})

exports.Conversation = sequelize.define("conversations",{
  id:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  user1:{
    type:DataTypes.STRING
  },
  user2:{
    type:DataTypes.STRING
  },
})

exports.Message = sequelize.define("messages", {
  id:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  content: {
    type:DataTypes.JSON
  },
  conversationId: {
    type: DataTypes.INTEGER,
    references:{
      model:"conversations",
      key:"id"
    }
  },
  userId:{
    type:DataTypes.INTEGER,
    references:{
      model:"users",
      key:"id"
    }
  }
},{timestamps:true})


this.User.hasMany(this.Post, {
  foreignKey: "userId",
});
this.Post.belongsTo(this.User)


this.User.hasMany(this.Comment, {
  foreignKey: "userId"
});
this.Comment.belongsTo(this.User)

this.Post.hasMany(this.Comment, {
  foreignKey:"postId"
})
this.Comment.belongsTo(this.Post)


this.User.hasMany(this.Like,{
  foreignKey:"userId"
})
this.Like.belongsTo(this.User)


this.Comment.hasMany(this.Like,{
  foreignKey: "commentId"
})
this.Like.belongsTo(this.Comment)

this.Comment.hasMany(this.Reply,{
  foreignKey: "commentId",
})
this.Reply.belongsTo(this.Comment)


this.Reply.hasMany(this.LikeReply,{
  foreignKey: "replyId"
})
this.LikeReply.belongsTo(this.Reply)


this.Conversation.hasMany(this.Message,{
  foreignKey: "conversationId"
})
this.Message.belongsTo(this.Conversation)

this.User.hasMany(this.Message,{
  foreignKey:"userId"
})

this.Message.belongsTo(this.User)

sequelize.sync();



