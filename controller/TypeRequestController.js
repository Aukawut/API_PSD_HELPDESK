const { sql, sqlConfig } = require("../config/connectDB");

class TypeRequestController {
  index = async (req, res) => {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(
        `SELECT [type_id], [type_name] FROM [V_HDCategory] ORDER BY type_id DESC` 
      ) // WHERE Type = 8 ที่ตาราง site_types
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.json({
            err: true,
            msg: err.msg,
          });
        } else {
          return res.json({ err: false, result: result.recordset });
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

  async getAllRequestTypes(req, res) {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(
        `SELECT t.* FROM [dbo].[site_types]t WHERE t.type = 8 ORDER BY t.type_id DESC`
      ) // WHERE Type = 8 ที่ตาราง site_types
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
  }

  async addRequestType(req, res) {
    try {
      const pool = await sql.connect(sqlConfig);

      const type = "8"; // 8 คือ type ที่อยู่บนตาราง site_types ใช้แบ่ง Group

      const { type_name, type_name_en, type_desc, status, empCode } = req.body;
      if (!type_name || !type_name_en || !status || !empCode) {
        return res.json({
          err: true,
          msg: "Payload is error!",
        });
      }
      // Insert Type Request
      const insertResult = await pool
        .request()
        .input("type", sql.NVarChar, type)
        .input("type_name", sql.NVarChar, type_name.trim())
        .input("type_name_en", sql.NVarChar, type_name_en.trim())
        .input("desc", sql.NVarChar, type_desc)
        .input("status", sql.NVarChar, status)
        .input("empCode", sql.NVarChar, empCode.trim())
        .query(
          `INSERT INTO [dbo].[site_types] ([type],[type_name],[type_name_en],[type_description],[type_Status],[type_CreateBy],[type_CreateDate])
            VALUES (@type,@type_name,@type_name_en,@desc,@status,@empCode,GETDATE())
            `
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

  async deleteRequestTypes(req, res) {
    const { id } = req.params;
    if (!id) {
      return res.json({ err: true, msg: "Error id" });
    }
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM site_types WHERE type_id = @id`)
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

  async deleteMutipleRequestTypes(req, res) {
    const { id } = req.body;
    if (id && id.length > 0) {
      const idType = id.join(",");
      const query = `DELETE FROM site_types WHERE type_id IN (${idType})`;
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

  async updateRequestType(req, res) {
    try {
      const pool = await sql.connect(sqlConfig);
      const { id } = req.params;
      const { type_name, type_name_en, type_desc, status, empCode } = req.body;
      if (!type_name || !type_name_en || !status || !empCode) {
        return res.json({
          err: true,
          msg: "Payload is error!",
        });
      }
      // Insert Type Request
      const UpdateResult = await pool
        .request()
        .input("id", sql.Int, id)
        .input("type_name", sql.NVarChar, type_name.trim())
        .input("type_name_en", sql.NVarChar, type_name_en.trim())
        .input("desc", sql.NVarChar, type_desc)
        .input("status", sql.NVarChar, status)
        .input("empCode", sql.NVarChar, empCode.trim())
        .query(`UPDATE site_types SET [type_name] = @type_name,[type_name_en] = @type_name_en,[type_description] = @desc,[type_Status] = @status,[type_UpdateBy] = @empCode,[type_UpdateDate] = GETDATE() WHERE type_id = @id`);
      return res.json({
        err: false,
        msg: "Updated !",
        status: "Ok",
        result: UpdateResult,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        err: true,
        msg: err.message,
      });
    }
  }
}

module.exports = TypeRequestController;
