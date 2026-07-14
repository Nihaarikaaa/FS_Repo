const express = require("express");
const app = express();
const cors = require("cors");
const routes = require("./routes");
const createError = require("http-errors");
const morgan = require("morgan");
const path = require("path");
const connectDb = require("./db");
connectDb();

const createServer = () => {
  app.use(
    cors({
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    })
  );

  app.use(morgan("dev"));
  app.use("/data/", express.static(path.join(__dirname, "./../data")));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/appointments', routes); // Register book routes under `/api`



  app.use((req, res, next) => {
    next(createError.NotFound("This route doesnot exist"));
  });

  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    console.log(err);
    res.json({
      status: err.status || 500,
      error: err.message,
    });
  });

  return app;
};

module.exports = createServer;
