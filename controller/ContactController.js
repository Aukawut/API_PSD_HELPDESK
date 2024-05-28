const { sql, sqlConfig } = require("../config/connectDB");

class ContactController {

async getContact(req, res) {
      const pool = await new sql.ConnectionPool(sqlConfig).connect();
      await pool
        .request()
        .query(
          `SELECT * FROM [DB_PSDHELPDESK].[dbo].[V_HDContact]`
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

module.exports = ContactController ;