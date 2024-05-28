const { sql, sqlConfig } = require("../config/connectDB");

class processController {
  index = async (req, res) => {
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
    await pool
      .request()
      .query(`SELECT * FROM [dbo].[site_process] ORDER BY id_process ASC`)
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.json({
            err: true,
            msg: err.msg,
          });
        } else {
          res.json({ err: false, result: result.recordset, status: "Ok" });
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
  async addProcess(req, res) {
    const { name_process, desc, empCode } = req.body;

    if (!name_process || !empCode) {
      return res.json({ err: true, msg: "Error payload" });
    }

    try {
      const pool = await new sql.ConnectionPool(sqlConfig).connect();
      const insert = await pool
        .request()
        .input("name", sql.NVarChar, name_process.trim())
        .input("desc", sql.NVarChar, desc)
        .input("empCode", sql.NVarChar, empCode)
        .query(
          `INSERT INTO site_process (name_process,desc_process,created_by,created_at) VALUES (@name,@desc,@empCode,GETDATE())`
        );

      return res.json({
        err: false,
        msg: "Added !",
        status: "Ok",
        result: insert,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        err: true,
        msg: err.message,
      });
    }
  }

  async updateProcess(req, res) {
    const { name_process, desc, empCode } = req.body;
    const { id } = req.params;

    if (!name_process || !empCode || !id) {
      return res.json({ err: true, msg: "Error payload" });
    }
    try {
      const pool = await new sql.ConnectionPool(sqlConfig).connect();
      const update = await pool
        .request()
        .input("name", sql.NVarChar, name_process.trim())
        .input("desc", sql.NVarChar, desc)
        .input("empCode", sql.NVarChar, empCode)
        .input("id", sql.Int, id)
        .query(
          `UPDATE site_process SET name_process = @name,desc_process = @desc,updated_by = @empCode,updated_at = GETDATE() WHERE id_process = @id`
        );

      return res.json({
        err: false,
        msg: "Updated !",
        status: "Ok",
        result: update,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        err: true,
        msg: err.message,
      });
    }
  }

  async deleteProcess(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.json({ err: true, msg: "Error params" });
    }

    try {
      const pool = await new sql.ConnectionPool(sqlConfig).connect();
      const deleteProcess = await pool
        .request()
        .input("id", sql.Int, id)
        .query(`DELETE FROM site_process WHERE id_process = @id`);

      return res.json({
        err: false,
        msg: "Deleted !",
        status: "Ok",
        result: deleteProcess,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        err: true,
        msg: err.message,
      });
    }
  }
  async deleteMultipleProcess(req, res) {
    const { id } = req.body;
    if (id && id.length > 0) {
      const idProcess = id.join(",");
      const query = `DELETE FROM site_process WHERE id_process IN (${idProcess})`;
      const pool = await new sql.ConnectionPool(sqlConfig).connect();
      await pool
        .request()
        .query(query)
        .then((result, err) => {
          if (err) {
            console.log(err);
            return res.json({
              err: true,
              msg: err.msg,
            });
          }
          return res.json({
            err: false,
            status: "Ok",
            msg: "Deleted!",
            result: result,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.json({
            err: true,
            msg: err,
          });
        });
    } else {
      return res.json({
        err: true,
        msg: "Some thing went wrong!",
      });
    }
  }
}

module.exports = processController;
