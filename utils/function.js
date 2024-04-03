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
        const dateNow = new Date().getFullYear().toString();
        const sub = dateNow.substring(2, 4);
        const callSubNo = result.recordset[0].call_subno.toString();

        return {
          err: false,
          callSubNo:
            callSubNo.substring(0, 2) === dateNow.substring(2, 4)
              ? callSubNo
              : sub + "000000",
        };
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
  getStringQuery(status) {
    // Function Filter status
    switch (status) {
      case "New Jobs":
        return "SELECT [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_status],[call_date2],[call_device] FROM [DB_PSDHELPDESK].[dbo].[V_HDNewJobs] ORDER BY call_date2 DESC, call_date DESC";
      case "Accept Jobs":
        return "SELECT [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device] FROM [DB_PSDHELPDESK].[dbo].[V_HDAcceptJobs] ORDER BY call_date2 DESC,call_date DESC";
      case "Finish Jobs":
        return "SELECT [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device] FROM [DB_PSDHELPDESK].[dbo].[V_HDFinishJobs] ORDER BY call_date2 DESC,call_date DESC";
      case "Outside Jobs":
        return "SELECT  [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device] FROM [DB_PSDHELPDESK].[dbo].[V_HDOutsideJobs] ORDER BY call_date2 DESC, call_date DESC";
      case "Improve Jobs":
        return "SELECT [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device] FROM [DB_PSDHELPDESK].[dbo].[V_HDProjectJobs] ORDER BY call_date2 DESC, call_date DESC";
      case "Close jobs":
        return "SELECT  [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device] FROM [DB_PSDHELPDESK].[dbo].[V_HDCloseJobs] ORDER BY call_date2 DESC, call_date DESC";
      default:
        return undefined;
    }
  }

  async GetDataMailContactInfo(leaderCode) {
    try {
      const stmt = `SELECT * FROM ESV_HDUserStore WHERE [UHR_EmpCode] = @leaderCode`;
      const pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .input("leaderCode", sql.NVarChar, leaderCode)
        .query(stmt);

      if (result && result.recordset.length > 0) {
        return result.recordset;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
    }
  }
  async sendMail(callSubno,callEmail,appName,callUser,callLeadercode,title,details){
    
   return true ;
  }

  

}
module.exports = FunctionUtils;
