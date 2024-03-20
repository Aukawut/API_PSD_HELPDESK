const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const authController = require("./controller/authController");
const userController = require("./controller/userController");
const jobsController = require("./controller/jobsController");

const jwtMiddleWare = require("./middleware/jwtMiddleWare");

const userInstance = new userController();
const authInstance = new authController();
const jobsInstance = new jobsController();

const jwtMiddlewareInstance = new jwtMiddleWare();

require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT;

app.get(
  "/read/users",
  jwtMiddlewareInstance.authenticateJWT,
  userInstance.index
);
app.post("/create/user", userInstance.createUser);
app.delete(
  "/delete/user/:id",
  jwtMiddlewareInstance.adminAuthenticateJWT,
  userInstance.deleteUser
);
app.put(
  "/update/user/:id",
  jwtMiddlewareInstance.adminAuthenticateJWT,
  userInstance.updateUser
);

app.get(
  "/jobs/count/admin",
  jwtMiddlewareInstance.adminAuthenticateJWT,
  jobsInstance.countJobs
);
app.get(
  "/jobs/jobByFactory",
  jwtMiddlewareInstance.adminAuthenticateJWT,
  jobsInstance.getTopFiveFactoryRequest
);

app.post("/auth/login", authInstance.login);
app.get("/auth/token", authInstance.authenticateJWT);

app.listen(PORT, () => {
  console.log(`Listen on port ${PORT}`);
});
