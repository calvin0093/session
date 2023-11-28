const express = require("express");

const {
  Signup,
  HomePage,
  LoginPage,
  registerPage,
  Logout,
  PostPage,
  CreatePost,
  DetailPost,
  ProfilePage,
  ChangePassword,
  SubmitNewPassword,
  GetEmail,  
  changeComment,
  deleteComment,
  authGoogle,
  getUser,
  getConversation,
  getPeopleMess,
  getPostRecommend
} = require("../controllers");
const passport = require("passport");
require("../utils/ppgoogle")

const router = express.Router();

router.route("/").get(LoginPage);
router.route("/register").get(registerPage);
router.route("/home").get(HomePage);
router.route("/api/v1/signin").post(
  passport.authenticate("local", {
    failureRedirect: "/",
    successRedirect: "/home",
  })
);
router.route("/api/v1/signup").post(Signup);
router.route("/logout").get(Logout);
router.route("/post").get(PostPage)
router.route("/api/v1/post").post(CreatePost)
router.route("/profile").get(ProfilePage)
router.route("/detailpost/:id").get(DetailPost)
router.route("/change").get(ChangePassword)
router.route("/api/v1/change").post(SubmitNewPassword)
router.route("/post/getemail").post(GetEmail)
router.route("/comment/change").post(changeComment)

router.get("/auth/google",
passport.authenticate('google', {scope:['profile', 'email']})
)
router.get('/auth/google/callback',
passport.authenticate('google', {failureRedirect:'/',successRedirect: "/home"})
)
router.route("/getuser").get(getUser)
router.route("/api/conversation").get(getConversation)
router.route("/api/getpeoplemess").post(getPeopleMess)
router.route("/api/recommendpost").post(getPostRecommend)




module.exports = router
