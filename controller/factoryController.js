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

  
}
module.exports = factoryController;
