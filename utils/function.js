const { sql, sqlConfig } = require("../config/connectDB");
const axios = require("axios");

class FunctionUtils {

 


  async getLastCallNo() {
    try {
      const pool = await new sql.ConnectionPool(sqlConfig).connect();
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
        return "SELECT [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_status],[call_date2],[call_device],[call_usercode] FROM [DB_PSDHELPDESK].[dbo].[V_HDNewJobs] ORDER BY call_date2 DESC, call_date DESC";
      case "Accept Jobs":
        return "SELECT [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device],[call_usercode] FROM [DB_PSDHELPDESK].[dbo].[V_HDAcceptJobs] ORDER BY call_date2 DESC,call_date DESC";
      case "Finish Jobs":
        return "SELECT [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device],[call_usercode] FROM [DB_PSDHELPDESK].[dbo].[V_HDFinishJobs] ORDER BY call_date2 DESC,call_date DESC";
      case "Outside Jobs":
        return "SELECT  [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device],[call_usercode] FROM [DB_PSDHELPDESK].[dbo].[V_HDOutsideJobs] ORDER BY call_date2 DESC, call_date DESC";
      case "Improve Jobs":
        return "SELECT [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device],[call_usercode] FROM [DB_PSDHELPDESK].[dbo].[V_HDProjectJobs] ORDER BY call_date2 DESC, call_date DESC";
      case "Close jobs":
        return "SELECT  [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device],[call_usercode] FROM [DB_PSDHELPDESK].[dbo].[V_HDCloseJobs] ORDER BY call_date2 DESC, call_date DESC";
      default:
        return undefined;
    }
  }

  getStringQueryUsers(status) {
    // Function Filter status
    switch (status) {
      case "New Jobs":
        return "SELECT [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_status],[call_date2],[call_device] FROM [DB_PSDHELPDESK].[dbo].[V_HDNewJobs] WHERE [call_usercode] = @EmpCode ORDER BY call_date2 DESC, call_date DESC";
      case "Accept Jobs":
        return "SELECT [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device] FROM [DB_PSDHELPDESK].[dbo].[V_HDAcceptJobs] WHERE [call_usercode] = @EmpCode ORDER BY call_date2 DESC,call_date DESC";
      case "Finish Jobs":
        return "SELECT [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device] FROM [DB_PSDHELPDESK].[dbo].[V_HDFinishJobs] WHERE [call_usercode] = @EmpCode ORDER BY call_date2 DESC,call_date DESC";
      case "Outside Jobs":
        return "SELECT  [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device] FROM [DB_PSDHELPDESK].[dbo].[V_HDOutsideJobs] WHERE [call_usercode] = @EmpCode ORDER BY call_date2 DESC, call_date DESC";
      case "Improve Jobs":
        return "SELECT [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device] FROM [DB_PSDHELPDESK].[dbo].[V_HDProjectJobs] WHERE [call_usercode] = @EmpCode ORDER BY call_date2 DESC, call_date DESC";
      case "Close jobs":
        return "SELECT  [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],[call_user],[call_staff],[call_status],[call_date2],[call_device] FROM [DB_PSDHELPDESK].[dbo].[V_HDCloseJobs] WHERE [call_usercode] = @EmpCode ORDER BY call_date2 DESC, call_date DESC";
      default:
        return undefined;
    }
  }

  async GetDataMailContactInfo(leaderCode) {
    console.log("User" + leaderCode);
    try {
      const stmt = `SELECT * FROM ESV_HDUserStore WHERE [UHR_EmpCode] = @leaderCode`;
      const pool = await new sql.ConnectionPool(sqlConfig).connect();
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
  async sendMail(
    callSubno,
    callEmail,
    appName,
    callUser,
    callLeadercode,
    title,
    details,
    ip
  ) {
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
    const jobInfo = await pool
      .request()
      .input("callSubNo", sql.NVarChar, callSubno)
      .query(
        `SELECT * FROM [DB_PSDHELPDESK].[dbo].[V_HDALLJobs] WHERE [call_subno] = @callSubNo`
      );

    if (jobInfo && jobInfo.recordset.length > 0) {
      const leaderInfo = await pool
        .request()
        .input("empCode", sql.NVarChar, callLeadercode)
        .query(
          `SELECT * FROM [DB_PSDHELPDESK].[dbo].[ESV_HDUserStore] WHERE [UHR_EmpCode] = @empCode`
        );

      const groupInfo = await pool
        .request()
        .input("empCode", callUser)
        .query(
          `SELECT * FROM [DB_PSDHELPDESK].[dbo].[V_PSTH_GROUPMAIL] WHERE [UHR_EmpCode] = @empCode`
        );

      // leader email (UHR_Email)
      const LeaderEmail =
        leaderInfo && leaderInfo.recordset.length > 0
          ? leaderInfo.recordset[0].UHR_Email
          : "";
      const UserEmail =
        jobInfo && jobInfo.recordset.length > 0
          ? jobInfo.recordset[0]?.UHR_email
          : "";
      const GroupMailUser =
        groupInfo && groupInfo.recordset.length > 0
          ? groupInfo.recordset[0].ESD_Group_PSTH?.toLowerCase()
          : "";

      const payload = {
        Subject: `${appName} [* ${jobInfo.recordset[0]?.call_status} *] [#${jobInfo.recordset[0].call_subno}] ${title}`,
        Application: appName,
        To: UserEmail,
        Leader: LeaderEmail,
        Group: GroupMailUser,
        CallSubNo: jobInfo.recordset[0].call_subno,
        Status: jobInfo.recordset[0]?.call_status,
      };

      // Function บันทึก Log
      const saveLogs = async (type,msg,ip,callNo) => {
        try {
          await pool
            .request()
            .input("type", sql.NVarChar, type)
            .input("msg", sql.NVarChar, msg)
            .input("by", sql.NVarChar, ip)
            .input("callNo", sql.NVarChar, callNo)
            .query(
              `INSERT INTO site_logs_action ([type_logs],[message],[client_ip],[call_subno]) 
          VALUES (@type,@msg,@by,@callNo)`
            )
            .then((result, err) => {
              if (err) {
                console.log(err);
              }
            });
        } catch (err) {
          console.log(err);
        }
      }


        

  // http://10.144.2.175:81/api/SendMail
      // await axios
      //   .post("http://10.144.2.175:81/api/SendMail", payload)
      //   .then(async(res) => {

      //     if (res.data !== "Email sent successfully!") {
      //       saveLogs('Send Email','ส่งอีเมลไม่สำเร็จ',ip,jobInfo.recordset[0].call_subno);
      //     }
      //     console.log(res.data);

      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     saveLogs('Send Email','ส่งอีเมลไม่สำเร็จ',ip,jobInfo.recordset[0].call_subno)
      //   });
    } else {
      console.log("Not send!");
    }
  }

  // Controller
  async saveLogsAction(callSubNo, message, type_logs, ip) {
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
    try {
      await pool
        .request()
        .input("type", sql.NVarChar, type_logs)
        .input("msg", sql.NVarChar, message)
        .input("by", sql.NVarChar, ip)
        .input("callNo", sql.NVarChar, callSubNo)
        .query(
          `INSERT INTO site_logs_action ([type_logs],[message],[client_ip],[call_subno]) 
      VALUES (@type,@msg,@by,@callNo)`
        )
        .then((result, err) => {
          if (err) {
            console.log(err);
          }
        });
    } catch (err) {
      console.log(err);
    }
  }

  async uploadFile(images, callSubNo) {
    const pool = await new sql.ConnectionPool(sqlConfig).connect();

    try {
      for (let i = 0; i < images.length; i++) {
        const fileBuffer = images[i].buffer;
        const contentType = images[i].mimetype;
        const originalFileName = images[i].originalname;
        const fileHex = `0x${fileBuffer.toString("hex")}`;
        await pool
          .request()
          .query(
            `INSERT INTO site_upload ([call_subno],[Name],[ContentType],[Data]) VALUES (${callSubNo},'${originalFileName}','${contentType}',${fileHex})`
          );
      }
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
module.exports = FunctionUtils;
