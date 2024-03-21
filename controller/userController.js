const { sql, sqlConfig } = require("../config/connectDB");

class userController {
  index = async (req, res) => {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(
        `SELECT UHR_EmpCode, UPPER(LEFT (UHR_FirstName_th, 1)) + LOWER(SUBSTRING(UHR_FirstName_th, 2, LEN(UHR_FirstName_th))) + '  ' + UPPER(LEFT (UHR_LastName_th, 1)) + LOWER(SUBSTRING(UHR_LastName_th, 2, LEN(UHR_LastName_th))) + ' (' + UHR_Department collate Thai_CI_AI + ')' AS UHR_FullName_th 
          FROM DB_PSDHELPDESK.dbo.V_PSTHSpecialLoginCenter 
          WHERE (UHR_StatusToUse = 'ENABLE') 
          ORDER BY UHR_FirstName_th`
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

module.exports = userController;
