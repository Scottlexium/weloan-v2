const { isEmail } = require("validator");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    Email: {
      type: String,
      unique: true,
      required: [true, "please enter an username"],
      lowercase: true,
      validate: [isEmail, "Please enter a valid username"],
    },
    password: {
      type: String,
      required: [true, "please enter a password"],
      minlength: [6, "Min password length is 6 char"],
    },
    fullName:{
        type: String,
        required: true,
    },
    username:{
        type: String,
        required: true,
        unique: true,
    },
    isAdmin: {
      type: String,
      default:false,
      required: true,
    },
    // newpath:{
    //     type: String,
    //     required: false
    // }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.statics.login = async function (Email, password) {
  const user = await this.findOne({ Email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("Incorrect email/password");
  }
  throw Error("Incorrect email/password");
};

const User = mongoose.model("user", userSchema);
module.exports = User;
