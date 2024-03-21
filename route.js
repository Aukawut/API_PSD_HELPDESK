const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const authController = require("./controller/authController");
const jobsController = require("./controller/jobsController");
const factoryController = require('./controller/factoryController')
const machineController = require('./controller/machineController')
const userController = require('./controller/userController');
const categoryController = require('./controller/categoryController');


const jwtMiddleWare = require("./middleware/jwtMiddleWare");

const authInstance = new authController();
const jobsInstance = new jobsController();
const factoryInstance = new factoryController();
const machineInstance = new machineController();
const userInstance = new userController();
const categoryInstance = new categoryController();

const jwtMiddlewareInstance = new jwtMiddleWare();

require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT;

// users Route
app.get('/users',jwtMiddlewareInstance.authenticateJWT,userInstance.index);

// category Route
app.get('/category',jwtMiddlewareInstance.authenticateJWT,categoryInstance.index);

// Job Route
app.get("/jobs/count/admin",jwtMiddlewareInstance.adminAuthenticateJWT,jobsInstance.countJobs);
app.get("/jobs/jobByFactory",jwtMiddlewareInstance.adminAuthenticateJWT,jobsInstance.getTopFiveFactoryRequest);

// Factory Route
app.get('/factory',jwtMiddlewareInstance.authenticateJWT,factoryInstance.index);

// Machine Route
app.get('/machine',jwtMiddlewareInstance.authenticateJWT,machineInstance.index)
app.get('/machine/:factory',jwtMiddlewareInstance.authenticateJWT,machineInstance.machineByFactory)
app.get('/machine/process/:mc_code',jwtMiddlewareInstance.authenticateJWT,machineInstance.processByMachine)


// auth Route
app.post("/auth/login", authInstance.login);
app.get("/auth/token", authInstance.authenticateJWT);

app.listen(PORT, () => {
  console.log(`Listen on port ${PORT}`);
});
