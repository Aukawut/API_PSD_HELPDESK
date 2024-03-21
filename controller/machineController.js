const { sql, sqlConfig } = require("../config/connectDB");

class machineController {
  async index(req, res) {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(
        `SELECT [site_mccode],[site_mcname]  FROM [dbo].[site_machinemaster_update] WHERE site_status='ACTIVE' ORDER BY site_mcname asc`
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
          res.json({
            err: false,
            result: result.recordset,
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

  async machineByFactory(req, res) {
    const { factory } = req.params;
    if (!factory) {
      return res.json({
        err: true,
        msg: "Error params!",
      });
    }
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("factory", sql.NVarChar, factory)
      .query(
        `SELECT s.[site_mccode],s.[site_mcname],p.name_process  FROM [dbo].[site_machinemaster_update]s
        LEFT JOIN site_process p ON s.site_process_id = p.id_process
        WHERE site_status='ACTIVE' 
        AND s.site_factory = @factory ORDER BY s.site_mcname asc`
      ) // Role id 1 = Admin
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            err: true,
            msg: err.msg,
          });
        }
        if (result.recordset && result.recordset.length > 0) {
          res.status(200).json({
            err: false,
            result: result.recordset,
          });
        } else {
          return res.json({
            err: true,
            msg: "Machine is not found!",
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
  async processByMachine(req, res) {
    const { mc_code } = req.params;
    if (!mc_code) {
      return res.json({
        err: true,
        msg: "Error params!",
      });
    }
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("mcName", sql.NVarChar, mc_code)
      .query(
        `SELECT m.site_mccode,p.name_process
        FROM [dbo].[site_machinemaster_update]m 
        LEFT JOIN site_process p ON m.site_process_id = p.id_process
        LEFT JOIN site_area a ON m.site_process_id = a.id_area WHERE m.site_mccode = @mcName
        AND m.site_status='ACTIVE'`
      ) 
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            err: true,
            msg: err.msg,
          });
        }
        if (result.recordset && result.recordset.length > 0) {
          res.status(200).json({
            err: false,
            result: result.recordset,
          });
        } else {
          return res.json({
            err: true,
            msg: "Process is not found!",
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
module.exports = machineController;
