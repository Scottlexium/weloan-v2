const express = require("express");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require("moment");
const Flutterwave = require("flutterwave-node-v3");
const open = require("open");
var session = require("express-session");
const cookieParser = require("cookie-parser");
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { requireAuth } = require("../middleware/authMiddleware");
const fs = require("fs");
const { profile } = require("console");
const { query } = require("express");
const qr = require("qrcode");
const nodemailer = require("nodemailer");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const ShortUniqueId = require("short-unique-id");
const dotenv = require("dotenv");
dotenv.config();
const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const serviceAccount = require("../we-loan-sdk.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const uid = new ShortUniqueId();

// const flw = new Flutterwave(PUBLIC_KEY, SECRET_KEY);
const flw = new Flutterwave(
  "FLWPUBK_TEST-5889c6d76beac180fdb3c050e1aa8b9f-X",
  "FLWSECK_TEST-9ef593753c40c3ee6c822dc99d028b81-X"
);

const JWT_SECRET = "Edobits";

let terminal;
let customerResult;

// getting users that booked;

module.exports.booked_get = (req, res) => {};

// profile multer upload

let newpath = "";

module.exports.profile_post = (req, res) => {
  filename = req.file.path;
  newpath = filename.split("public").slice(0, 6).join("");
  console.log(`uploaded at ${newpath}`);
  res.render("profile", { url: newpath });
};

module.exports.homepage = (req, res) => {
  console.log(uid.seq());
  res.redirect("/dashboard");
};
// dashboard
// let newuserId;
module.exports.dashboard_get = async (req, res) => {
  const userId = res.locals.id.id;
  console.log("na na", userId);
  res.render("Dashboard");
};

// handle errors

const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { username: "", password: "" };

  // incorrect email
  if (err.message === "Incorrect username/password") {
    errors.username = "This user isnt recorgnised by Weloan";
  }

  // duplicate error code
  if (err.code === 11000) {
    errors.username = "Email already exists";
    return errors;
  }
  // validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

// 3 days in seconds converted
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: maxAge,
  });
};

// logout method

module.exports.logout_get = (req, res) => {
  res.cookie("Weloan", "", { maxAge: 1 });
  res.redirect("/login");
};

// authentication
module.exports.login_get = (req, res) => {
  res.render("login");
};

// let personUsername;

module.exports.login_post = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.login(username, password);
    const token = createToken(user._id);
    res.cookie("Weloan", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      sameSite: "lax",
    });
    res.status(200).json({ user: user._id });
    // personUsername = username;
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.register_post = async (req, res) => {
  console.log(req.body);
  const { Email, password, username } = req.body;
  try {
    let isAdmin = false;
    const user = await User.create({
      Email,
      password,
      username,
      isAdmin,
    });

    // add some data to firestore
    const docRef = db.collection("users").doc(username);

    await docRef.set({
      Email: Email,
      username: username,
      isAdmin: isAdmin,
      firstName: "Not Provided",
      lastName: "Not Provided",
      address: "Not Provided",
    });

    const token = createToken(user._id);
    res.cookie("Weloan", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      sameSite: "lax",
    });
    // res.redirect('/dashboard');
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.register_get = (req, res) => {
  res.render("register");
};

// Get Bus List
module.exports.homepage_get = (req, res) => {
  res.render("home");
};

module.exports.profile_get = (req, res) => {
  res.render("Profile");
};
