const mongoose = require("mongoose");
const crypto = require("crypto");
const uuidv1 = require("uuid/v1");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      //trim filter spaces
      trim: true,
    },

    email: {
      type: String,
      required: true,
      //unique says that every time the value shouldbe
      unique: true,
      trim: true,
    },
    userinfo: {
      type: String,
      //required: true,
    },
    alerts: [
      {
        name: {
          type: String,
        },
        message: {
          type: String,
        },
      },
    ],

    encry_password: {
      type: String,
      required: true,
    },
    //salt is cryptography
    salt: String,
    //role tells about user 0=normal user,1=ADMIN
  },
  { timestamps: true }
);
//setting a virtual field password
userSchema.virtual("password").set(function (password) {
  this._password = password;
  this.salt = uuidv1();
  this.encry_password = this.securePassword(password);
});

userSchema.methods = {
  //check password
  authenticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },
  //making password more secure by encrypyting
  securePassword: function (plainpassword) {
    if (!plainpassword) return "";

    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainpassword)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};
module.exports = mongoose.model("User", userSchema);
