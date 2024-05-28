const { sql, sqlConfig } = require("../config/connectDB");

class ImageController {
  async index(req, res) {
    const callNo = req.params.call_no;
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
    await pool
      .request()
      .input('call_no', sql.NVarChar, callNo)
      .query(`SELECT * FROM [dbo].[site_upload] WHERE [call_subno] = @call_no`)
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.json({
            err: true,
            msg: err.msg,
          });
        }
        if (result.recordset && result.recordset.length > 0) {
          return res.json({
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
        return res.json({
          err: true,
          msg: err,
        });
      });
  }
}
module.exports = ImageController;
