const { sql, sqlConfig } = require("../config/connectDB");

class FunctionUtils {
  async getLastCallNo() {
    try {
      const pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .query(
          `SELECT TOP (1) call_subno + 1 AS call_subno FROM dbo.site_calls ORDER BY call_subno DESC`
        );
      if (result.recordset && result.recordset.length > 0) {
        console.log(result.recordset);
        return result.recordset[0].call_subno
      } else {
        return {
          err: true,
          data: null,
        };
      }
    } catch (err) {
      console.log(err);
      return {
        err: true,
        data: null,
      };
    }
  }
}
module.exports = FunctionUtils;
