const { sql, sqlConfig } = require("../config/connectDB");
class jobTypeController {
  async getJobsType(req, res) {
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
    await pool
      .request()
      .query(
        `SELECT type_id,type_name+'('+type_name_en+')' AS type_name FROM [DB_PSDHELPDESK].[dbo].[V_HDPriority]`
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
            status: "Ok",
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
  async getFollowUpList(req, res) {
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
    await pool
      .request()
      .query(
        `SELECT [type_id],[type],[type_name],[type_name_en] FROM [DB_PSDHELPDESK].[dbo].[site_types] WHERE type = '9'`
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
            status: "Ok",
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

module.exports = jobTypeController;
