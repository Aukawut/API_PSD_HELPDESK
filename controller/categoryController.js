const { sql, sqlConfig } = require("../config/connectDB");

class categoryController {
  index = async (req, res) => {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(
        `SELECT [type_id], [type_name] FROM [V_HDCategory]`
      )
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.json({
            err: true,
            msg: err.msg,
          });
        } else {
          res.json({ err: false, result: result.recordset });
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

module.exports = categoryController;
