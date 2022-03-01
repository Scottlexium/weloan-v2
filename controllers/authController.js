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
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const ShortUniqueId = require('short-unique-id');
const dotenv = require('dotenv');
dotenv.config();


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
  res.render("register", { url: newpath });
};


module.exports.homepage = (req, res)=>{
  console.log(uid.seq());
  res.redirect('/dashboard');
}
// dashboard
// let newuserId;
module.exports.dashboard_get = async (req, res) => {
  const userId = res.locals.id.id;
  console.log("na na", userId);
  res.render('Dashboard')
  // const user = await User.findById(userId)
  // // .sort({createdAt: -1})
  //     console.log(user);
  //     terminal = user.terminal;
  //     const uTerm = user.terminal;
  //     // const cusrData = await CustomerData.find({terminal:{$eq:"Ringroad"}})
  //     const cusrData = await CustomerData.find({ busTerminal:{"$regex": uTerm} })
  //     // at this point the fetch shows results only relating to users equals the signed in users terminal
  //     .sort({createdAt: -1})
  //     console.log(cusrData);
        // res.render("Dashboard", { user, docs: cusrData });
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
  const { Email, password, fullName, username } =
    req.body;
  try {
    let isAdmin = false;
    const user = await User.create({
      Email,
      password,
      fullName,
      username,
      isAdmin,
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
    
  // Bus.findAll()
  // .then(buses =>{
  //   console.log(buses);
  //   res.render("home", {
  //     bus:buses
  //   });
  // }).catch(err => console.log(err));
};

// get bus result

module.exports.result_get = (req, res) => {
  Bus.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("result", { Bus: result });
    })
    .catch((err) => {
      console.log(err);
    });
};

// display add bus page

// Add a Bus

const newbusSeat = {
  seat01: false,
  seat02: false,
  seat03: false,
  seat04: false,
  seat05: false,
  seat06: false,
  seat07: false,
  seat08: false,
  seat09: false,
  seat10: false,
  seat11: false,
  seat12: false,
  seat13: false,
  seat14: false,
  seat15: false,
};

let globtest;
let aId = null;
let newBody = null;
let choosen;
module.exports.seat_post = async (req, res) => {
  // console.log(req.body);
  const de = req.body;
  aId = req.params.id;
  let {
    seat01,
    seat02,
    seat03,
    seat04,
    seat05,
    seat06,
    seat07,
    seat08,
    seat09,
    seat10,
    seat11,
    seat12,
    seat13,
    seat14,
  } = req.body;
  newBody = req.body;
  console.log( newBody );
  
  choosen = JSON.stringify(newBody);
  

  try {
    Bus.findById(aId).then((result) => {
      const dbPrice = result.price;
      const seat = parseInt(dbPrice);
      const newGlobNoOfSeat = parseInt(globalNoOfSeat);
      console.log(seat * newGlobNoOfSeat);
      const total = seat * newGlobNoOfSeat;
      res.render("payment", {
        busdetails: result,
        seatId: aId,
        globalNoOfSeat,
        total,
      });
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.seat_get = async (req, res) => {
  const seatId = req.params.id;
  console.log(`The id na ${seatId}`);
  Bus.findById(seatId)
    .then((result) => {
      console.log(result);
      res.render("seats", { cl: result, seatId: seatId });
    })
    .catch((err) => console.log(err));
};
module.exports.addBus_get = (req, res) => {
  res.render("add");
};

// const busSeat = {
const seat01 = false;
const seat02 = false;
const seat03 = false;
const seat04 = false;
const seat05 = false;
const seat06 = false;
const seat07 = false;
const seat08 = false;
const seat09 = false;
const seat10 = false;
const seat11 = false;
const seat12 = false;
const seat13 = false;
const seat14 = false;
const seat15 = false;
// };

module.exports.updateBus_post = (req, res)=>{
  let terminal = req.body.terminal;
  let company = req.body.company;
  let from = req.body.from;
  let to = req.body.to;
  let price = req.body.price;
  let quantity = 14;
  let time = req.body.time;
  let date = req.body.date;
  const newBus = new Bus({
    company,
    terminal,
    from,
    to,
    price,
    quantity,
    date,
    time,
    seat01,
    seat02,
    seat03,
    seat04,
    seat05,
    seat06,
    seat07,
    seat08,
    seat09,
    seat10,
    seat11,
    seat12,
    seat13,
    seat14,
    seat15,
  })
  newBus
      .save()
      .then((result) => {
        console.log(Object.keys(result.busSeat[0]).length);
      })
      .catch((err) => {
        console.log(err);
      });

    res.redirect("dashboard");
  
}
module.exports.addBus_post = (req, res) => {
  let afa;
  const m = moment();
  const curM = m.toISOString();
  const currentMoment = moment().subtract(0, "days");
  const endMoment = moment().add(3, "days");
  while (currentMoment.isBefore(endMoment, "day")) {
    let terminal = req.body.terminal;
    let company = req.body.company;
    let from = req.body.from;
    let to = req.body.to;
    let price = req.body.price;
    // let quantity = req.body.quantity;
    let quantity = 145;
    let time = req.body.time;
    let date = req.body.date;
    // let { company, from, to, price, quantity, date } = req.body;
    let naNow = currentMoment.format("YYYY-MM-DD");
    console.log(`Loop at ${naNow}`);
    currentMoment.add(1, "days");
    date = naNow;

    // console.log(req.body);
    console.log("Saved");
    const bus = new Bus({
      company,
      terminal,
      from,
      to,
      price,
      quantity,
      date,
      time,
      seat01,
      seat02,
      seat03,
      seat04,
      seat05,
      seat06,
      seat07,
      seat08,
      seat09,
      seat10,
      seat11,
      seat12,
      seat13,
      seat14,
      seat15,
    });
    bus
      .save()
      .then((result) => {
        console.log(Object.keys(result.busSeat[0]).length);
      })
      .catch((err) => {
        console.log(err);
      });

    res.redirect("dashboard");
  }
};

// search for seats bus company

// let date;
// let from;
// let to;
// busCompany = busdetails.company;
// from = busdetails.from;
// to = busdetails.to;
// date = busdetails.date;
// initPrice = busdetails.price;
let globalNoOfSeat = 0;
let busCompany = "";
let from = "";
let to = "";
let date;
let initPrice;
let price;
let time;
let gender;
let fName;
let Email;
let phone;
let Address;
let kname;
let kmail;
let kphone;
let kaddress;
let kgender;
// i just set the above to me same below
module.exports.search_post = (req, res) => {
  from = req.query.from;
  to = req.query.to;
  console.log(`User Wants ${req.query.noOfSeat} Seats`);
  const noOfSeat = parseInt(req.query.noOfSeat);
  globalNoOfSeat = noOfSeat;
  date = req.query.date;
  console.log(typeof noOfSeat);

  Bus.find(
    { from: from, to: to, date: date, quantity: { $gte: noOfSeat } },
    (error, arrayOfResults) => {
      res.render("companies", { Bus: arrayOfResults, globalNoOfSeat });
      console.log(arrayOfResults);
    }
  );
};

// get details after bus selected

module.exports.selected_get = (req, res) => {
  const busId = req.params.id;
  Bus.findById(busId)
    .then((busdetails) => {
      busCompany = busdetails.company;
      time = busdetails.time;
      res.render("customer", { busdetails, globalNoOfSeat });
    })
    .catch((err) => console.log(err));
};

//
module.exports.proceed_get = (req, res) => {
  const busId = req.params.id;
  Bus.findById(busId)
    .then((busdetails) => {
      time = busdetails.time
      console.log(busdetails.company);
      // res.send(busdetails.company);
      // res.render('payment',{busdetails})
    })
    .catch((err) => console.log(err));
};

let newUserBody = null;
module.exports.submit_post = (req, res) => {
  console.log(req.body);
  // let { fName, Email, phone, Address, kname, kmail, kphone, kaddress } =
  // req.body;
  newUserBody = req.body;
  fName = req.body.fName;
  Email = req.body.Email;
  phone = req.body.phone;
  Address = req.body.Address;
  gender = req.body.gender;
  kname = req.body.kname;
  kmail = req.body.kmail;
  kphone = req.body.kphone;
  kaddress = req.body.kaddress;
  kgender = req.body.kgender;

  // the above makes it possible to set the params
  const busId = req.params.id;
  // the bus id ehn i might change it incase i
  // change the post sender to fetch instead of form style
  const seatId = req.params.id;
  Bus.findById(seatId)
    .then((busdetails) => {
      initPrice = busdetails.price;
      price = globalNoOfSeat * initPrice;
      time = busdetails.time;
      res.render("seats", { cl: busdetails, seatId: seatId });
    })
    .catch((err) => console.log(err));


  

  // dont forget to add plate number of bus

  // I commented this out so i can make the customers details saved after payment
  // const customerData = new CustomerData({
  //     fName,
  //     Email,
  //     phone,
  //     Address,
  //     busId,
  //     busCompany,
  //     from,
  //     to,
  //     globalNoOfSeat,
  //     initPrice,
  //     date,
  //     kname,
  //     kmail,
  //     kphone,
  //     kaddress,
  //     price,
  // });
  // console.log(customerData);
  // customerData
  //     .save()
  //     .then((result) => {
  //         console.log("Saving Customer Data:" + "" + result);
  //     })
  //     .catch((err) => {
  //         console.log(err);
  //     });
};

let busId;
module.exports.paying_post = (req, res) => {
  busId = req.params.id;
  console.log(busId);
  Bus.findById(busId)
    .then((busdetails) => {
      time = busdetails.time
      const dbPrice = busdetails.price;
      const seat = parseInt(dbPrice);
      const newGlobNoOfSeat = parseInt(globalNoOfSeat);
      console.log(seat * newGlobNoOfSeat);
      res.render("payment", { busdetails });
    })
    .catch((err) => console.log(err));

  const cardNo = req.body.cardNo;
  const ExpMonth = req.body.ExpMonth;
  const ExpYear = req.body.ExpYear;
  const cardCvv = req.body.cardCvv;
  const pin = req.body.pin;
};

let finalParamsId = null;
let status = null;
let tx_ref = null;
let trans_id = null;
let bookings = null;
let cusFName = null;
let seatVal = null;
let cusPhone = null;
let cusAddress = null;
let total = null;
let cusId = null;
let cusMac = null;
let ticketNo = null;
module.exports.done_post = async (req, res) => {
  
  finalParamsId = req.params.id;
  bookings = req.body.bookings;
  cusFName = req.body.cusFName;
  seatVal = req.body.seatVal;
  cusPhone = req.body.cusPhone;
  cusAddress = req.body.cusAddress;
  total = req.body.total;
  cusId = req.body.cusMac;
  ticketNo = `OY-${uid()}`;
  console.log(ticketNo);
  console.log(req.params.id);
  console.log(req.body);


  // try {
  //   const updates = newBody;
  //   const options = { new: true };
  //   const result = await Bus.findByIdAndUpdate(aId, updates, options);
  //   globtest = result;
  //   console.log(result);
  //   const dbPrice = result.price;
  //   const seat = parseInt(dbPrice);
  //   const newGlobNoOfSeat = parseInt(globalNoOfSeat);
  //   console.log(seat * newGlobNoOfSeat);
  //   const total = seat * newGlobNoOfSeat;
  //   res.render("payment", {
  //     busdetails: result,
  //     seatId: aId,
  //     globalNoOfSeat,
  //     total,
  //   });
  // } catch (error) {
  //   console.log(error);
  // }
  // res.send("successful")
};

module.exports.done_get = async (req, res) => {
  // let finalQuantity = 0;
  // let previousAvail = null;
  const final_Id= req.params.id;
  let emailRep = null;
  status = req.query.status;
  tx_ref = req.query.tx_ref;
  trans_id = req.query.transaction_id;
  const finalData = {
    finalParamsId,
    status,
    tx_ref,
    trans_id,
    bookings,
    cusFName,
    seatVal,
    cusPhone,
    cusAddress,
    total,
    cusId,
    cusMac,
    ticketNo,
  };
  console.log(`Final Data: ${finalData}`);
  try {
    if (finalData.status !== "successful") {
      res.send("Error in payment");
    } else {
      try {
        let finalQuantity;
        // Bus.findById(final_Id)
        // .then((busRes)=>{
        //   previousAvail = busRes.quantity;
        //   finalQuantity = previousAvail-finalData.seatVal;
        //   console.log(finalQuantity);
        // }).catch(err => console.log(err))
        const updates = newBody;

        // const quantityUpdate = finalQuantity;
        const options = { new: true };
        const result = await Bus.findByIdAndUpdate(aId, updates, options);

        const findQuantity = await Bus.findById(final_Id);
        const previousAvail = findQuantity.quantity;
        const subtract = finalData.seatVal;
        finalQuantity = previousAvail-subtract;
        findQuantity.quantity
        const quantityResult = await Bus.findByIdAndUpdate(final_Id, { $set: { quantity: finalQuantity }}, options);
        // const quantityResult = await Bus.findByIdAndUpdate(final_Id, quantityUpdate, options);
        console.log(`Its now ${quantityResult}`);
        globtest = result;
        console.log(result);
        const dbPrice = result.price;
        const seat = parseInt(dbPrice);
        const busTerminal = result.terminal;
        const newGlobNoOfSeat = parseInt(globalNoOfSeat);
        console.log(seat * newGlobNoOfSeat);
        const total = seat * newGlobNoOfSeat;
        // Storing user
        const customerData = new CustomerData({
          fName,
          Email,
          phone,
          Address,
          busId,
          busCompany,
          from,
          to,
          globalNoOfSeat,
          initPrice,
          date,
          time,
          kname,
          kmail,
          kphone,
          kaddress,
          total,
          busTerminal,
          gender,
          kgender,
          choosen,
          ticketNo,
        });
        console.log(customerData);
        customerData
          .save()
          .then((userData) => {
            console.log("Saving Customer Data:" + "" + userData);
          })
          .catch((err) => {
            console.log(err);
          });
          emailRep = customerData.Email;
          console.log(`Email is:${emailRep}`);
        // user stored
        const uri = `Transaction-Ref: ${finalData.tx_ref}, Status: ${status}, TicketId: ${ticketNo}`;

        qr.toDataURL(uri, async (err, src)=>{

          // create reusable transporter object using the default SMTP transport
          let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
              user: "support@Weloan.com", // generated ethereal user
              pass: process.env.SUPPORT_PWD, // generated ethereal password
            },
          });
        
          // send mail with defined transport object
          let info = await transporter.sendMail({
            from: '"Weloan" <support@Weloan.com>', // sender address
            to: emailRep, // list of receivers
            subject: "Payment Receipt From Weloan", // Subject line
            html: `<p>James is working on the email template with inline styling</p>`, // html body
          });
          console.log(err)
          if(err) res.send("An error occured");
          res.render("receipt", {
            Receipt: finalData,
            busCompany,
            from,
            to,
            date,
            time,
            busTerminal,
            src,
            globalNoOfSeat
          });
          
        })
        
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// remains saving user to db
