const { sql, sqlConfig } = require("../config/connectDB");

class factoryController {
  async index(req, res) {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(
        `WITH CTE_Machine AS (
          SELECT site_factory, COUNT(*) AS machine_count
          FROM [dbo].[site_machinemaster_update]
          GROUP BY site_factory
      ) SELECT sf.sf_Code AS site_factory, COALESCE(CTE_Machine.machine_count, 0) AS machine_count FROM site_factory sf
      LEFT JOIN CTE_Machine ON sf.sf_Code = CTE_Machine.site_factory
      WHERE sf.sf_Status = 'ENABLE'
      ORDER BY sf.sf_Code`
      )
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
            status:'Ok'
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
  async getFactory(req, res) {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(`SELECT * FROM [dbo].[site_factory] ORDER BY sf_ID DESC`)
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
            status: "Ok",
            result: result.recordset,
          });
        } else {
          return res.json({
            err: true,
            msg: "Data is not found!",
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

  async deleteFactory(req, res) {
    const { id } = req.params;
    if (!id) {
      return res.json({ err: true, msg: "Error id" });
    }
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM [dbo].[site_factory] WHERE sf_ID = @id`)
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
  }
  async deleteMutipleFactory(req, res) {
    const { id } = req.body;
    if (id && id.length > 0) {
      const idFactory = id.join(",");
      const query = `DELETE FROM site_factory WHERE sf_ID IN (${idFactory})`;
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

  async addFactory(req, res) {
    const { code, name, desc, empCode, status } = req.body;

    if (!code || !name || !empCode || !status) {
      return res.json({ err: true, msg: "Error payload" });
    }

    try {
      const pool = await sql.connect(sqlConfig);
      // Check if factory code already exists
      const existingFactory = await pool
        .request()
        .input("code", sql.NVarChar, code.trim())
        .query(`SELECT * FROM site_factory WHERE sf_Code = @code`);

      if (existingFactory.recordset.length > 0) {
        return res.json({
          err: true,
          msg: "Factory code is duplicated !",
        });
      }
      // Insert New Factory
      const insertResult = await pool
        .request()
        .input("code", sql.NVarChar, code.trim())
        .input("name", sql.NVarChar, name.trim())
        .input("desc", sql.NVarChar, desc)
        .input("empCode", sql.NVarChar, empCode.trim())
        .input("status", sql.NVarChar, status)
        .execute(
          `INSERT INTO [dbo].[site_factory] (sf_Code,sf_Name,sf_Description,sf_CreateBy,sf_Status,sf_CreateDate) VALUES (@code,@name,@desc,@empCode,@status,GETDATE())`
        );

      return res.json({
        err: false,
        msg: "Added !",
        status: "Ok",
        result: insertResult,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        err: true,
        msg: err.message,
      });
    }
  }

  async updateFactory(req, res) {
    const { id } = req.params;
    const { code, name, desc, empCode, status } = req.body;

    if (!id || !code || !name  || !empCode || !status) {
      return res.json({ err: true, msg: "Error payload" });
    }
    const pool = await sql.connect(sqlConfig);
    try {
      // Check if factory code already exists
      const existingFactory = await pool
        .request()
        .input("code", sql.NVarChar, code.trim())
        .input("id", sql.Int, id.trim())
        .query(`SELECT * FROM site_factory WHERE sf_Code = @code AND sf_ID <> @id`);

      if (existingFactory.recordset.length > 0) {
        return res.json({
          err: true,
          msg: "Factory code is duplicated !",
        });
      }
    } catch (err) {
      return res.json({
        err: true,
        msg: err,
      });
    }

    await pool
      .request()
      .input("id", sql.Int, id.trim())
      .input("code", sql.NVarChar, code.trim())
      .input("name", sql.NVarChar, name.trim())
      .input("desc", sql.NVarChar, desc)
      .input("empCode", sql.NVarChar, empCode.trim())
      .input("status", sql.NVarChar, status)
      .query(
        `UPDATE [dbo].[site_factory] SET [sf_Code] = @code,[sf_Name] = @name,[sf_Description] = @desc,[sf_UpdateDate] = GETDATE()
         ,[sf_UpdateBy] = @empCode
         ,[sf_Status] = @status
          WHERE sf_ID = @id`
      )
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
          msg: "Updated!",
          status:'Ok'
        });
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
module.exports = factoryController;
