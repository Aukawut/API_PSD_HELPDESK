const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require('multer');

const authController = require("./controller/authController");
const jobsController = require("./controller/jobsController");
const factoryController = require('./controller/factoryController')
const machineController = require('./controller/machineController')
const userController = require('./controller/userController');
const categoryController = require('./controller/categoryController');


const jwtMiddleWare = require("./middleware/jwtMiddleWare");
const FileUploadMiddleware = require("./middleware/FileUploadMiddleware");

const authInstance = new authController();
const jobsInstance = new jobsController();
const factoryInstance = new factoryController();
const machineInstance = new machineController();
const userInstance = new userController();
const categoryInstance = new categoryController();

const jwtMiddlewareInstance = new jwtMiddleWare();
const FileUploadInstance = new FileUploadMiddleware();

require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const cpUpload = upload.fields([{ name: 'images', maxCount: 8 }])

// users Route
app.get('/users',jwtMiddlewareInstance.authenticateJWT,userInstance.index);

// category Route
app.get('/category',jwtMiddlewareInstance.authenticateJWT,categoryInstance.index);

// Job Route
app.get("/jobs/count/admin",jwtMiddlewareInstance.adminAuthenticateJWT,jobsInstance.countJobs);
app.get("/jobs/jobByFactory",jwtMiddlewareInstance.adminAuthenticateJWT,jobsInstance.getTopFiveFactoryRequest);
app.post("/jobs/add",FileUploadInstance.fileUploadMiddleware,(req,res,next) => {
   res.json({
    file:'123'
   })
});

// Factory Route
app.get('/factory',jwtMiddlewareInstance.authenticateJWT,factoryInstance.index);
app.get('/allFactory',jwtMiddlewareInstance.authenticateJWT,factoryInstance.getFactory);
app.post('/factory/add',jwtMiddlewareInstance.adminAuthenticateJWT,factoryInstance.addFactory)
app.delete('/factory/delete/:id',jwtMiddlewareInstance.adminAuthenticateJWT,factoryInstance.deleteFactory)
app.post('/factory/delete/multiple',jwtMiddlewareInstance.adminAuthenticateJWT,factoryInstance.deleteMutipleFactory)
app.put('/factory/update/:id',jwtMiddlewareInstance.adminAuthenticateJWT,factoryInstance.updateFactory)

// Machine Route
app.get('/machine',jwtMiddlewareInstance.authenticateJWT,machineInstance.index)
app.get('/machine/:factory',jwtMiddlewareInstance.authenticateJWT,machineInstance.machineByFactory)
app.get('/machine/process/:mc_code',jwtMiddlewareInstance.authenticateJWT,machineInstance.processByMachine)


// auth Route
app.post("/auth/login", authInstance.login);
app.get("/auth/token", authInstance.authenticateJWT);

app.get('/test',jobsInstance.test)

app.listen(PORT, () => {
  console.log(`Listen on port ${PORT}`);
});
