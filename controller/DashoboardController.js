const { sql, sqlConfig } = require("../config/connectDB");

class DashoboardController {
  async getTop5MachineRequest(req, res) {
    try {
      const pool = await sql.connect(sqlConfig);
      const result = await pool.request().query(
        `WITH CTE_C AS (SELECT TOP 5 COUNT (*) AS AMOUNT_SUM,call_device3 
        FROM [dbo].[V_HDALLJobs] GROUP BY call_device3)
        SELECT CTE_C.call_device3,CTE_C.AMOUNT_SUM 
    ,CASE WHEN m.site_mcname IS NULL THEN CTE_C.call_device3 ELSE m.site_mcname END As site_mcname FROM CTE_C
     LEFT JOIN [dbo].site_machinemaster_update m 
    ON CTE_C.call_device3 = m.[site_mccode]`
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
    let day = parseInt(req.body.day);
    if (isNaN(day) || day === undefined) {
      // Provide a default value if day is NaN or undefined
      day = -30; // Or whatever default value you want
    }
    try {
      const pool = await sql.connect(sqlConfig);
      const result = await pool.request().query(
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
                a.call_date2 >= DATEADD(day, ${day}, GETDATE()) AND a.call_date2 <= GETDATE()
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
  async dataSummaryPerMonthYear(req, res) {
    const { year } = req.params;
    try {
      const pool = await sql.connect(sqlConfig);
      const result = await pool.request().input("year", sql.Int, year)
        .query(`WITH MonthNumbers AS (
        SELECT 1 AS month_n
        UNION ALL
        SELECT month_n + 1
        FROM MonthNumbers 
        WHERE month_n < 12
    )
    SELECT 
        MonthNumbers.month_n,
        COALESCE(f.[close], 0) AS [close],
        COALESCE(f.[overdue], 0) AS [overdue],
        COALESCE(f.[new], 0) AS [new],
        COALESCE(f.[year_], @year) AS [year_],
        CASE 
            WHEN MonthNumbers.month_n = 1 THEN 'Jan' 
            WHEN MonthNumbers.month_n = 2 THEN 'Feb' 
            WHEN MonthNumbers.month_n = 3 THEN 'Mar' 
            WHEN MonthNumbers.month_n = 4 THEN 'Apr'
            WHEN MonthNumbers.month_n = 5 THEN 'May'
            WHEN MonthNumbers.month_n = 6 THEN 'Jun'
            WHEN MonthNumbers.month_n = 7 THEN 'Jul'
            WHEN MonthNumbers.month_n = 8 THEN 'Aug'
            WHEN MonthNumbers.month_n = 9 THEN 'Sep'
            WHEN MonthNumbers.month_n = 10 THEN 'Oct'
            WHEN MonthNumbers.month_n = 11 THEN 'Nov'
            WHEN MonthNumbers.month_n = 12 THEN 'Dec' 
        END AS [month_name],
        COALESCE(f.[month_n], MonthNumbers.month_n) AS [month_n] 
    FROM 
        MonthNumbers 
    LEFT JOIN 
        [V_Summary_Final] f ON f.month_n = MonthNumbers.month_n AND f.year_ = @year`);

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
  async getMenuYear(req, res) {
    try {
      const pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .query(
          `SELECT COUNT (*) as amount_,[year_] FROM [dbo].[V_Summary_Final] GROUP BY [year_] ORDER BY year_ DESC`
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

  async getMachineHistory(req, res) {
    try {
      const {dateFrom,dateTo} = req.params ;

      const pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .query(
          `SELECT [call_id],[call_subno],[call_date],[call_subtitle],[call_details],[call_request],[call_device],[call_user],[call_problem_device],[site_factory],[call_date2],[call_status],[call_staff] FROM [dbo].[V_HDSummaryMachineInfo_Final]
          WHERE call_date between '${dateFrom} 00:00:00' and '${dateTo} 23:59:59' 
          ORDER BY [call_subno] DESC`
        );
      if (result && result.recordset?.length > 0) {
        return res.json({
          err: false,
          result: result.recordset,
          status:"Ok"
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
