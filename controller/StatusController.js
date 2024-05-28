const { sql, sqlConfig } = require("../config/connectDB");

class StatusController {
  async getListsStatus(rqe, res) {
    const q = `SELECT type_id,type_name+'('+type_name_en+')' AS type_name FROM [DB_PSDHELPDESK].[dbo].[V_HDStatus]`;

    const pool = await new sql.ConnectionPool(sqlConfig).connect();
    await pool
      .request()
      .query(`${q}`)
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
module.exports = StatusController;
