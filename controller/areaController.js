const { sql, sqlConfig } = require("../config/connectDB");

class areaController {
  index = async (req, res) => {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(
        `SELECT * FROM [dbo].[site_area] ORDER BY id_area ASC`
      )
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.json({
            err: true,
            msg: err.msg,
          });
        } else {
          res.json({ err: false, result: result.recordset,status:'Ok' });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          err: true,
          msg: err,
        });
      });
  };
}

module.exports = areaController;
