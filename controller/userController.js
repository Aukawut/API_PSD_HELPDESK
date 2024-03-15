const { sql, sqlConfig } = require("../config/connectDB");

class userController {
    
   index = async (req, res) => {
        const pool = await sql.connect(sqlConfig)
        await pool
          .request()
          .query(`SELECT a.* FROM TBL_USERS a ORDER BY a.Id DESC`)
          .then((result, err) => {
            if (err) {
              console.log(err)
              return res.json({
                err: true,
                msg: err.msg,
              })
            } else {
              res.json({ err: false, result: result })
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
      
    createUser = async (req, res) => {
        const { username, password, position } = req.body
        if (!username || !password || !position) {
          return res.json({
            err: true,
            msg: "Please completed information!",
          })
        } else {
          const pool = await sql.connect(sqlConfig)
          await pool
            .request()
            .input("username", sql.NVarChar, username)
            .input("password", sql.NVarChar, password)
            .input("position", sql.NVarChar, position)
            .input("role", sql.NVarChar, "USER")
            .query(
              `INSERT INTO TBL_USERS (USERNAME,PASSWORD,ROLE,POSITION) VALUES (@username,@password,@role,@position)`
            )
            .then((result, err) => {
              if (err) {
                console.log(err)
                return res.json({
                  err: true,
                  msg: err.msg,
                })
              } else {
                res.json({ err: false, msg: `${username} Created!`, result: result })
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
      
      deleteUser = async (req, res) => {
        const id = req.params.id
        if (!id) {
          return res.json({
            err: true,
            msg: "User Id Error!",
          })
        }
      
        const pool = await sql.connect(sqlConfig)
        await pool
          .request()
          .input("id", sql.Int, id)
          .query(`DELETE FROM TBL_USERS WHERE Id = @id`)
          .then((result, err) => {
            if (err) {
              console.log(err)
              return res.json({
                err: true,
                msg: err.msg,
              })
            } else {
              if (result.rowsAffected[0] > 0) {
                  res.json({ err: false, msg: `User Deleted!`, result: result })
                }else{
                  res.json({ err: true, msg: `Something went wrong!`})
                }
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
      updateUser = async (req, res) => {
        const id = req.params.id
        const { role, position } = req.body
        if (!role || !position || !id) {
          return res.json({
            err: true,
            msg: "Please completed information!",
          })
        } else {
          const pool = await sql.connect(sqlConfig)
          await pool
            .request()
            .input("position", sql.NVarChar, position)
            .input("role", sql.NVarChar, role)
            .input("id", sql.Int, id)
            .query(
              `UPDATE TBL_USERS SET ROLE = @role,POSITION = @position WHERE Id = @id`
            )
            .then((result, err) => {
              if (err) {
                console.log(err)
                return res.json({
                  err: true,
                  msg: err.msg,
                })
              } else {
                if (result.rowsAffected[0] > 0) {
                  res.json({ err: false, msg: `User Update!`, result: result })
                }else{
                  res.json({ err: true, msg: `Something went wrong!`})
                }
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
}

module.exports = userController;
