const { sql, sqlConfig } = require("../config/connectDB");

class categoryController {
  index = async (req, res) => {
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
    await pool
      .request()
      .query(
        `SELECT * FROM site_categorygroup WHERE CG_Type = '3' ORDER BY [CG_ID] DESC`
      )
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.json({
            err: true,
            msg: err.msg,
          });
        } else {
          return res.json({
            err: false,
            result: result.recordset,
            status: "Ok",
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
  };

  async addCategory(req, res) {
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
    const cgType = "3"; // 3 คือ Group ของ Category ระบบ PSD Helpdesk
    const { cgName, cgNameEn, cgDesc, empCode, status } = req.body; //รับ Body Json จาก Client
    if (!cgName || !cgNameEn  || !empCode || !status) {
      return res.json({
        err: true,
        msg: "Payload is empty!",
      });
    }
    await pool
      .request()
      .input("cg_type", sql.NVarChar, cgType.trim())
      .input("cg_name", sql.NVarChar, cgName.trim())
      .input("cg_name_en", sql.NVarChar, cgNameEn.trim())
      .input("cg_desc", sql.NVarChar, cgDesc.trim())
      .input("cg_create_by", sql.NVarChar, empCode.trim())
      .input("status", sql.NVarChar, status)
      .query(
        `INSERT INTO [dbo].[site_categorygroup] ([CG_Type],[CG_Name],[CG_Name_en],[CG_Description],[CG_CreateBy],[CG_Status])
        VALUES (@cg_type,@cg_name,@cg_name_en,@cg_desc,@cg_create_by,@status)
        `
      )
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.json({
            err: true,
            msg: err.msg,
          });
        } else {
          return res.json({
            err: false,
            msg: "Added!",
            result: result,
            status: "Ok",
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

  async deleteCategory(req, res) {
    const { id } = req.params;
    if (!id) {
      return res.json({ err: true, msg: "Error id" });
    }
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
    await pool
      .request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM site_categorygroup WHERE CG_ID = @id`)
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

  async deleteCategoryFactory(req, res) {
    const { id } = req.body;
    if (id && id.length > 0) {
      const idCategory = id.join(",");
      const query = `DELETE FROM site_categorygroup WHERE CG_ID IN (${idCategory})`;
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

  async updateCategory(req, res) {
    const { id } = req.params;
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
    const { cgName, cgNameEn, cgDesc, empCode, status } = req.body; //รับ Body Json จาก Client
    if (!cgName || !cgNameEn  || !empCode || !status || !id) {
      return res.json({
        err: true,
        msg: "Payload is empty!",
      });
    }
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("cg_name", sql.NVarChar, cgName.trim())
      .input("cg_name_en", sql.NVarChar, cgNameEn.trim())
      .input("cg_desc", sql.NVarChar, cgDesc.trim())
      .input("cg_update_by", sql.NVarChar, empCode.trim())
      .input("status", sql.NVarChar, status)
      .query(
        `UPDATE [dbo].[site_categorygroup] SET [CG_Name] = @cg_name,[CG_Name_en] = @cg_name_en,
        [CG_Description] = @cg_desc,[CG_UpdateBy] = @cg_update_by,[CG_UpdateDate] = GETDATE(),[CG_Status] = @status 
        WHERE CG_ID = @id`
      )
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.json({
            err: true,
            msg: err.msg,
          });
        } else {
          return res.json({
            err: false,
            msg: "Updated!",
            result: result,
            status: "Ok",
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
}

module.exports = categoryController;
