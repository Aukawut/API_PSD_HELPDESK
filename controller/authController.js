const { sql, sqlConfig } = require("../config/connectDB")
const jwt = require("jsonwebtoken")

class authController {

    login = async (req, res) => {
        const { username, password } = req.body
        if (!username || !password) {
          return res.json({
            err: true,
            msg: "Please completed information!",
          })
        }
        const pool = await sql.connect(sqlConfig)
        await pool
          .request()
          .input("username", sql.NVarChar, username)
          .query(`SELECT TOP 1 s.* FROM TBL_USERS s WHERE s.USERNAME = @username`)
          .then((result, err) => {
            if (err) {
              console.log(err)
              return res.json({
                err: true,
                msg: err.msg,
              })
            }
            if (result.recordset && result.recordset.length > 0) {
              const token = jwt.sign(result.recordset[0], process.env.JWT_SECRET, {
                expiresIn: '1h',
              })
              res.json({ err: false, result: result, msg: "Login success!", token })
            } else {
              return res.json({
                err: true,
                msg: "Something went wrong!",
              })
            }
          })
          .catch((err) => {
            console.log(err)
            res.json({
              err: true,
              msg: err,
            })
          })
      }
}


module.exports = authController;
