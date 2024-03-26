const { sql, sqlConfig } = require("../config/connectDB");

class machineController {
  async index(req, res) {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(
        `SELECT [site_mccode],[site_mcname]  FROM [dbo].[site_machinemaster_update] WHERE site_status='ENABLE' ORDER BY site_mcname asc`
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

  async machineList(req, res) {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(
        `SELECT m.site_mcid,m.site_mccode,m.site_process_id,m.site_mcname,m.site_description,m.site_factory,site_status,m.site_mccreatedate,m.site_mccreateby,a.name_area,p.name_process FROM [dbo].[site_machinemaster_update] m 
        LEFT JOIN [dbo].[site_area]a ON m.site_area_id = a.id_area
        LEFT JOIN [dbo].[site_process]p ON m.site_process_id = p.id_process ORDER BY m.site_mcname ASC`
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
        WHERE site_status='ENABLE' 
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
        AND m.site_status='ENBLE'`
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

  async addMachine(req, res) {
    const { code, name, desc, status, process, factory, empCode } = req.body;
    if (!code || !name || !status || !process || !factory || !empCode) {
      return res.json({
        err: true,
        msg: "Data is empty!",
      });
    }

    try {
      const pool = await sql.connect(sqlConfig);
      const resultCheck = await pool
        .request()
        .input("mcCode", sql.NVarChar, code)
        .query(
          `SELECT * FROM site_machinemaster_update WHERE site_mccode = @mcCode`
        );

      if (resultCheck.recordset && resultCheck.recordset.length > 0) {
        return res.json({
          err: true,
          msg: "Machine code is duplicated!",
        });
      }

      const InsertResult = await pool
        .request()
        .input("mcCode", sql.NVarChar, code)
        .input("mcName", sql.NVarChar, name)
        .input("mcDesc", sql.NVarChar, desc)
        .input("mcStatus", sql.NVarChar, status)
        .input("mcProcess", sql.Int, process)
        .input("mcFactory", sql.NVarChar, factory)
        .input("empCode", sql.NVarChar, factory)
        .query(
          `INSERT INTO site_machinemaster_update (site_mccode,site_mcname,site_description,site_status,site_process_id,site_factory,site_mccreatedate,site_mccreateby) 
          VALUES (@mcCode,@mcName,@mcDesc,@mcStatus,@mcProcess,@mcFactory,GETDATE(),@empCode)`
        );
      return res.json({
        err: false,
        msg: "Added!",
        status: "Ok",
        result: InsertResult,
      });
    } catch (err) {
      return res.json({
        err: true,
        msg: err.message,
      });
    }
  }
  async updateMachine(req, res) {
    const { id } = req.params;
    const { code, name, desc, status, process, factory, empCode } = req.body;
    if (!code || !name || !status || !process || !factory || !empCode || !id) {
      return res.json({
        err: true,
        msg: "Data is empty!",
      });
    }

    try {
      const pool = await sql.connect(sqlConfig);
      const resultCheck = await pool
        .request()
        .input("mcCode", sql.NVarChar, code)
        .input("id", sql.Int, id)
        .query(
          `SELECT * FROM site_machinemaster_update WHERE site_mccode = @mcCode AND site_mcid <> @id`
        );

      if (resultCheck.recordset && resultCheck.recordset.length > 0) {
        return res.json({
          err: true,
          msg: "Machine code is duplicated!",
        });
      }
      const InsertResult = await pool
        .request()
        .input("id", sql.Int, id)
        .input("mcCode", sql.NVarChar, code)
        .input("mcName", sql.NVarChar, name)
        .input("mcDesc", sql.NVarChar, desc)
        .input("mcStatus", sql.NVarChar, status)
        .input("mcProcess", sql.Int, process)
        .input("mcFactory", sql.NVarChar, factory)
        .input("empCode", sql.NVarChar, factory)
        .query(
          `UPDATE site_machinemaster_update SET site_mccode = @mcCode,site_mcname = @mcName,site_description = @mcDesc,site_status = @mcStatus,site_process_id = @mcProcess,site_factory = @mcFactory,site_mcupdatedate = GETDATE(),site_mcupdateby = @empCode WHERE site_mcid = @id`
        );
      return res.json({
        err: false,
        msg: "Updated!",
        status: "Ok",
        result: InsertResult,
      });
    } catch (err) {
      return res.json({
        err: true,
        msg: err.message,
      });
    }
  }
  async deleteMachine(req, res) {
    const { id } = req.params;
    if (!id) {
      return res.json({
        err: true,
        msg: "Params error!",
      });
    }
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM site_machinemaster_update WHERE site_mcid = @id`)
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            err: true,
            msg: err.msg,
          });
        }
          return res.json({
            err:false,
            msg:'Deleted',
            status:'Ok',
            result:result
          })
      })
      .catch((err) => {
        console.log(err);
        res.json({
          err: true,
          msg: err,
        });
      });
  }
  async deleteMultipleMachine(req, res) {
    const { id } = req.body;
    if (id && id.length > 0) {
      const idMachine = id.join(",");
      const query = `DELETE FROM site_machinemaster_update WHERE site_mcid IN (${idMachine})`;
      const pool = await sql.connect(sqlConfig);
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
module.exports = machineController;
