const { sql, sqlConfig } = require("../config/connectDB");

class DashoboardController {
  async getTop5MachineRequest(req, res) {
    try {
      const pool = await sql.connect(sqlConfig);
      const result = await pool.request().query(
        `WITH CTE_C AS (SELECT TOP 5 COUNT (*) AS AMOUNT_SUM,call_device3 
          FROM [dbo].[V_HDALLJobs] GROUP BY call_device3)
          SELECT * FROM CTE_C`
      );
      if (result && result.recordset?.length > 0) {
        return res.json({
          err: false,
          result: result.recordset,
        });
      } else {
        return res.json({
          err: true,
          msg: "Not Founded!",
        });
      }
    } catch (err) {
      return res.json({
        err: true,
        msg: err,
      });
    }
  }
  async dataOverdueByDays(req, res) {

    try {
      const { day } = req.params;
      if(!day || day == undefined){
        return res.json({
            err:true,
            msg:'day is empty!'
        })
      }
      const pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .query(
          `WITH CTE_OVERDUE AS (
            SELECT 
                COUNT(*) AS amount, 
                CAST(CONVERT(varchar(10), call_date, 101) AS datetime) AS ConvertedDate
            FROM 
                [dbo].[V_HDOverdueInfo]
            GROUP BY 
                CAST(CONVERT(varchar(10), call_date, 101) AS datetime)
        )
        SELECT 
            COUNT(*) AS AMOUNT_CLOSE, 
            a.ConvertedDate AS DATE_CLOSE,
            COALESCE(CTE_OVERDUE.ConvertedDate, a.ConvertedDate) AS DATE_OVERDUE,
            COALESCE(CTE_OVERDUE.amount, 0) AS AMOUNT_OVER 
        FROM 
            (
            SELECT  
                call_id,
                call_subno,
                call_date2,
                [call_status],
                CAST(CONVERT(varchar(10), call_date2, 101) AS datetime) AS ConvertedDate,
                [call_user],
                'close' AS status
            FROM 
                [DB_PSDHELPDESK].[dbo].[V_HDCloseJobs]
            ) a 
        LEFT JOIN 
            CTE_OVERDUE ON CTE_OVERDUE.ConvertedDate = a.ConvertedDate 
        WHERE  
            a.call_date2 >= DATEADD(day, -${day}, GETDATE()) AND a.call_date2 <= GETDATE()
        GROUP BY 
            a.ConvertedDate, 
            CTE_OVERDUE.ConvertedDate, 
            CTE_OVERDUE.amount  
        ORDER BY 
            a.ConvertedDate ASC`
        );
      if (result && result.recordset?.length > 0) {
        return res.json({
          err: false,
          result: result.recordset,
        });
      } else {
        return res.json({
          err: true,
          msg: "Not Founded!",
        });
      }
    } catch (err) {
      return res.json({
        err: true,
        msg: err,
      });
    }

  }
}

module.exports = DashoboardController;
