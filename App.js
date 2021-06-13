const express = require("express");
const weatherRouter = require("./Routes/auth");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
app.get("/", (req, res) => {
  res.send("this is working");
});
app.use(bodyParser.json());
app.use(cookieparser());
app.use(cors());
app.use("/weather", weatherRouter);

//DB connect
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  });

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log("working on port", process.env.PORT);
});
