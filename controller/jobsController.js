const { sql, sqlConfig } = require("../config/connectDB");

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
}

module.exports = jobsController;
