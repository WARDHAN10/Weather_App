const User = require("../model/user");
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
require("dotenv").config();

exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const user = new User(req.body);

  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: "wrong",
      });
    }
    res.json({
      name: user.name,
      email: user.email,
      id: user._id,
    });
  });
};

exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "USER email does not exists",
      });
    }

    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    res.cookie("token", token, {
      expire: new Date() + 9999,
    });
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, name, email, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User is signout successfully",
  });
};
exports.isSignIn = expressJwt({
  secret: process.env.SECRET,
  userProperty: "auth",
});

exports.isAuthenticate = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
      id: req.auth._id,
      i: req.auth,
      p: req.profile,
    });
  }
  next();
};
exports.getUserById = (req, res, next, id) => {
  //middle ware finding the user by id
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "no user FOUND",
      });
    }
    //saving the user into profile which will created in the front end

    req.profile = user;
    next();
  });
};

exports.alertCt = (req, res) => {
  const { message } = req.body;

  console.log("userID");
  User.updateMany(
    {},
    { $push: { alerts: { name: req.profile.name, message: message } } }
  ).then((err, data) => {
    if (err) {
      console.log(err);
    }
    res.json(data);
  });
};

exports.getAllalert = (req, res) => {
  const alert = req.profile.alerts;
  console.log(alert);
  res.json(alert);
};
exports.removeAlert = (req, res) => {
  let alert = req.profile.alerts;
  alert.remove((err, alerts) => {
    if (err) {
      res.status(400).json({
        error: "failed to delete the product",
      });
    }
    res.json({
      message: "deletion successfull",
      alerts,
    });
  });
};
