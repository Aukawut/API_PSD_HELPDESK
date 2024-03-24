const { sql, sqlConfig } = require("../config/connectDB");
const FunctionUtils = require("../utils/function");

const FunctionInstance = new FunctionUtils();

class jobsController {
  async countJobs(req, res) {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(`SELECT * FROM [dbo].[V_CountJob_DashboardAdmin]`)
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.json({
            err: true,
            msg: err.msg,
          });
        }
        if (result.recordset && result.recordset.length > 0) {
          return res.status(200).json({
            err: false,
            result: result.recordset,
            msg: "Ok",
          });
        } else {
          return res.json({
            err: true,
            msg: "Something went wrong!",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          err: true,
          msg: err,
        });
      });
  }

  async getTopFiveFactoryRequest(req, res) {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(
        `SELECT TOP 5 [label],[y] FROM [dbo].[Chart_TotalJobs] ORDER BY y DESC`
      )
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.json({
            err: true,
            msg: err.msg,
          });
        }
        if (result.recordset && result.recordset.length > 0) {
          return res.status(200).json({
            err: false,
            result: result.recordset,
            msg: "Ok",
          });
        } else {
          return res.json({
            err: true,
            msg: "Something went wrong!",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          err: true,
          msg: err,
        });
      });
  }

  async addJob(req, res) {
    const a = new console.log();
    res.json({
      file: req.file,
    });
  }
  async test(req, res) {
    try {
      const callSubno = await FunctionInstance.getLastCallNo()
      const dateNow = new Date().getFullYear().toString()
      console.log(callSubno);
      console.log(dateNow.substring(2,4));
    } catch (error) {
      console.error(error);
      // Handle error appropriately
    }
  }
}

module.exports = jobsController;
