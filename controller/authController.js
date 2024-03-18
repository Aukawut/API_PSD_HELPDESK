const { sql, sqlConfig } = require("../config/connectDB");
const jwt = require("jsonwebtoken");

class authController {
  login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.json({
        err: true,
        msg: "Please completed information!",
      });
    }
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(
        `SELECT TOP 1 s.* FROM site_users s WHERE s.username_ad = @username AND system_role = 1`
      ) // Role id 1 = Admin
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.json({
            err: true,
            msg: err.msg,
          });
        }
        if (result.recordset && result.recordset.length > 0) {
          const token = jwt.sign(result.recordset[0], process.env.JWT_SECRET, {
            expiresIn: "1h",
          });
          res.json({
            err: false,
            result: result,
            msg: "Login success!",
            token,
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
  };

  authenticateJWT = (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1]; // Split the header and extract the token
      if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
            return res.status(403).json({ err: true, msg: err.message });
          }
          return res.status(200).json({
            err: false,
            msg: "Token corrected!",
            user:decoded
          });
        });
      } else {
        res.status(401).json({ err: true, msg: "Bearer token is required." });
      }
    } else {
      res
        .status(401)
        .json({ err: true, msg: "Authorization header is missing." });
    }
  };
}

module.exports = authController;
