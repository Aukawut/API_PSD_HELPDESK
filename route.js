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
const TypeRequestController = require('./controller/TypeRequestController')
const processController = require('./controller/processController')
const jobTypeController = require('./controller/jobTypeController')
const RankJobController = require('./controller/RankJobController')
const ContactController = require('./controller/ContactController')
const StatusController = require('./controller/StatusController')
const DashoboardController = require('./controller/DashoboardController')
const ImageController = require('./controller/ImageController')

const jwtMiddleWare = require("./middleware/jwtMiddleWare");
const FileUploadMiddleware = require("./middleware/FileUploadMiddleware");

const authInstance = new authController();
const jobsInstance = new jobsController();
const factoryInstance = new factoryController();
const machineInstance = new machineController();
const userInstance = new userController();
const categoryInstance = new categoryController();
const TypeRequestInstance = new TypeRequestController();
const processInstance = new processController();
const jobTypeInstance = new jobTypeController();
const RankInstance = new RankJobController();
const ContactInstance = new ContactController();
const StatusInstance = new StatusController();
const DashoboardInstance = new DashoboardController();
const ImageInstance = new ImageController();

const jwtMiddlewareInstance = new jwtMiddleWare();
const FileUploadInstance = new FileUploadMiddleware();

require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT;



// users Route
app.get('/users',jwtMiddlewareInstance.authenticateJWT,userInstance.index);

// Type Route
app.get('/requestType',jwtMiddlewareInstance.authenticateJWT,TypeRequestInstance.index);
app.get('/allRequestType',jwtMiddlewareInstance.authenticateJWT,TypeRequestInstance.getAllRequestTypes);
app.post('/requestType/add',jwtMiddlewareInstance.adminAuthenticateJWT,TypeRequestInstance.addRequestType);
app.delete('/requestType/delete/:id',jwtMiddlewareInstance.adminAuthenticateJWT,TypeRequestInstance.deleteRequestTypes)
app.post('/requestType/del/multiple',jwtMiddlewareInstance.adminAuthenticateJWT,TypeRequestInstance.deleteMutipleRequestTypes)
app.put('/requestType/update/:id',jwtMiddlewareInstance.adminAuthenticateJWT,TypeRequestInstance.updateRequestType)

// category Route
app.get('/category',jwtMiddlewareInstance.authenticateJWT,categoryInstance.index);
app.post('/category/add',jwtMiddlewareInstance.adminAuthenticateJWT,categoryInstance.addCategory);
app.delete('/category/delete/:id',jwtMiddlewareInstance.adminAuthenticateJWT,categoryInstance.deleteCategory)
app.post('/category/del/multiple',jwtMiddlewareInstance.adminAuthenticateJWT,categoryInstance.deleteCategoryFactory)
app.put('/category/update/:id',jwtMiddlewareInstance.adminAuthenticateJWT,categoryInstance.updateCategory)

// Job Request Route
app.post("/jobs/add",FileUploadInstance.fileUploadMiddleware,jobsInstance.addJob);
app.get("/jobs/count/admin",jwtMiddlewareInstance.adminAuthenticateJWT,jobsInstance.countJobs);
app.get("/jobs/jobByFactory",jwtMiddlewareInstance.adminAuthenticateJWT,jobsInstance.getTopFiveFactoryRequest);
app.get('/jobs/information/:status',jwtMiddlewareInstance.authenticateJWT,jobsInstance.getDetailsJobByStatus)
app.get('/jobs/informationUser/:status/:code',jwtMiddlewareInstance.authenticateJWT,jobsInstance.getDetailsJobByStatusUser)
app.get('/jobs/details/call/:callNo/:callId',jwtMiddlewareInstance.authenticateJWT,jobsInstance.getDetailsJobByCallNo)
app.get('/jobs/info/:id',jwtMiddlewareInstance.authenticateJWT,jobsInstance.getInfoJobByCallId)
app.put('/job/update/:call_subno',jwtMiddlewareInstance.adminAuthenticateJWT,jobsInstance.updateJob)
app.get('/job/solve/:subNo',jwtMiddlewareInstance.authenticateJWT,jobsInstance.getSolve)
app.get('/job/comment/:subNo',jwtMiddlewareInstance.authenticateJWT,jobsInstance.getCommentDetails)
app.get('/user/dashboardUser/:code',jwtMiddlewareInstance.authenticateJWT,jobsInstance.countJobsUser)

// Job Type 
app.get('/jobType',jwtMiddlewareInstance.authenticateJWT,jobTypeInstance.getJobsType)
app.get('/followUpList',jwtMiddlewareInstance.authenticateJWT,jobTypeInstance.getFollowUpList)

// Status Type
app.get('/statusList',jwtMiddlewareInstance.authenticateJWT,StatusInstance.getListsStatus)


// Rank 
app.get('/rank',jwtMiddlewareInstance.authenticateJWT,RankInstance.getRank)

// Factory Route
app.get('/factory',jwtMiddlewareInstance.authenticateJWT,factoryInstance.index);
app.get('/allFactory',jwtMiddlewareInstance.authenticateJWT,factoryInstance.getFactory);
app.post('/factory/add',jwtMiddlewareInstance.adminAuthenticateJWT,factoryInstance.addFactory)
app.delete('/factory/delete/:id',jwtMiddlewareInstance.adminAuthenticateJWT,factoryInstance.deleteFactory)
app.post('/factory/del/multiple',jwtMiddlewareInstance.adminAuthenticateJWT,factoryInstance.deleteMutipleFactory)
app.put('/factory/update/:id',jwtMiddlewareInstance.adminAuthenticateJWT,factoryInstance.updateFactory)

// Machine Route
app.get('/machine',jwtMiddlewareInstance.authenticateJWT,machineInstance.index)
app.get('/machineLists',jwtMiddlewareInstance.authenticateJWT,machineInstance.machineList)
app.get('/machines/:factory',jwtMiddlewareInstance.authenticateJWT,machineInstance.machineByFactory)
app.get('/machine/process/:mc_code',jwtMiddlewareInstance.authenticateJWT,machineInstance.processByMachine)
app.post('/machine/add',jwtMiddlewareInstance.adminAuthenticateJWT,machineInstance.addMachine)
app.put('/machine/update/:id',jwtMiddlewareInstance.adminAuthenticateJWT,machineInstance.updateMachine)
app.delete('/machine/delete/:id',jwtMiddlewareInstance.adminAuthenticateJWT,machineInstance.deleteMachine)
app.post('/machine/del/multiple',jwtMiddlewareInstance.adminAuthenticateJWT,machineInstance.deleteMultipleMachine)

// Process Route
app.get("/process",jwtMiddlewareInstance.authenticateJWT,processInstance.index)
app.post("/process/add",jwtMiddlewareInstance.adminAuthenticateJWT,processInstance.addProcess)
app.put("/process/update/:id",jwtMiddlewareInstance.adminAuthenticateJWT,processInstance.updateProcess)
app.delete("/process/delete/:id",jwtMiddlewareInstance.adminAuthenticateJWT,processInstance.deleteProcess)
app.post("/process/del/multiple",jwtMiddlewareInstance.adminAuthenticateJWT,processInstance.deleteMultipleProcess)

// Contact Route 
app.get('/contact',jwtMiddlewareInstance.authenticateJWT,ContactInstance.getContact)

//Dashboard Route 
app.get('/data/topfiveMcRequest',jwtMiddlewareInstance.adminAuthenticateJWT,DashoboardInstance.getTop5MachineRequest)
app.post('/data/dataOverdueByDays',jwtMiddlewareInstance.adminAuthenticateJWT,DashoboardInstance.dataOverdueByDays)
app.get('/data/summary/:year',jwtMiddlewareInstance.adminAuthenticateJWT,DashoboardInstance.dataSummaryPerMonthYear)
app.get('/data/menuYear',jwtMiddlewareInstance.adminAuthenticateJWT,DashoboardInstance.getMenuYear)
app.get('/report/machineHistory/:dateFrom/:dateTo',jwtMiddlewareInstance.adminAuthenticateJWT,DashoboardInstance.getMachineHistory)

//Image
app.get('/images/:call_no',jwtMiddlewareInstance.authenticateJWT,ImageInstance.index)

// auth Route
app.post("/auth/login", authInstance.login);
app.get("/auth/token", authInstance.authenticateJWT);



app.listen(PORT, () => {

  console.log(`Server Listening on port ${PORT}`);


});
