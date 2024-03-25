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
const TypeRequestController = require('./controller/TypeRequestController')
const areaController = require('./controller/areaController')


const jwtMiddleWare = require("./middleware/jwtMiddleWare");
const FileUploadMiddleware = require("./middleware/FileUploadMiddleware");

const authInstance = new authController();
const jobsInstance = new jobsController();
const factoryInstance = new factoryController();
const machineInstance = new machineController();
const userInstance = new userController();
const categoryInstance = new categoryController();
const TypeRequestInstance = new TypeRequestController();
const areaInstance = new areaController();

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

// Type Route
app.get('/requestType',jwtMiddlewareInstance.authenticateJWT,TypeRequestInstance.index);
app.get('/allRequestType',jwtMiddlewareInstance.authenticateJWT,TypeRequestInstance.getAllRequestTypes);
app.post('/requestType/add',jwtMiddlewareInstance.adminAuthenticateJWT,TypeRequestInstance.addRequestType);
app.delete('/requestType/delete/:id',jwtMiddlewareInstance.adminAuthenticateJWT,TypeRequestInstance.deleteRequestTypes)
app.post('/requestType/delete/multiple',jwtMiddlewareInstance.adminAuthenticateJWT,TypeRequestInstance.deleteMutipleRequestTypes)
app.put('/requestType/update/:id',jwtMiddlewareInstance.adminAuthenticateJWT,TypeRequestInstance.updateRequestType)

// category Route
app.get('/category',jwtMiddlewareInstance.authenticateJWT,categoryInstance.index);
app.post('/category/add',jwtMiddlewareInstance.adminAuthenticateJWT,categoryInstance.addCategory);
app.delete('/category/delete/:id',jwtMiddlewareInstance.adminAuthenticateJWT,categoryInstance.deleteCategory)
app.post('/category/delete/multiple',jwtMiddlewareInstance.adminAuthenticateJWT,categoryInstance.deleteCategoryFactory)
app.put('/category/update/:id',jwtMiddlewareInstance.adminAuthenticateJWT,categoryInstance.updateCategory)

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


//Area Route
app.get('/area',jwtMiddlewareInstance.authenticateJWT,areaInstance.index);

// auth Route
app.post("/auth/login", authInstance.login);
app.get("/auth/token", authInstance.authenticateJWT);



app.listen(PORT, () => {
  console.log(`Listen on port ${PORT}`);
});
