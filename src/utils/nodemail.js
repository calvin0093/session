const nodemail = require("nodemailer")
require("dotenv").config()
var smtpTransport = require('nodemailer-smtp-transport');

exports.smtp = nodemail.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure:false,
    auth: {
        user: process.env.USERMAIL,
        pass: process.env.PASSWORDMAIL
    },
}))