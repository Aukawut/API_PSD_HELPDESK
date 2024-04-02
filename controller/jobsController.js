const { sql, sqlConfig } = require("../config/connectDB");
const FunctionUtils = require("../utils/function");
const fs = require("fs");
const moment = require("moment/moment");
const IP = require("ip");

const FunctionInstance = new FunctionUtils();

class jobsController {
  async countJobs(req, res) {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(`SELECT * FROM [dbo].[V_CountJob_DashboardAdmin]`)
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.json({
            err: true,
            msg: err.msg,
          });
        }
        if (result.recordset && result.recordset.length > 0) {
          return res.status(200).json({
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

  async getTopFiveFactoryRequest(req, res) {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(
        `SELECT TOP 5 [label],[y] FROM [dbo].[Chart_TotalJobs] ORDER BY y DESC`
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
          return res.status(200).json({
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

  async getDetailsJobByStatus(req, res) {
    const { status } = req.params;
    const strQuery = FunctionInstance.getStringQuery(status);
    if (strQuery !== undefined) {
      const pool = await sql.connect(sqlConfig);
      await pool
        .request()
        .query(`${strQuery}`)
        .then((result, err) => {
          if (err) {
            return res.json({
              err: true,
              msg: err,
            });
          }
          if (result.recordset && result.recordset.length > 0) {
            return res.status(200).json({
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
          return res.json({ err: true, msg: err.message });
        });
    } else {
      return res.json({
        err: true,
        msg: "error",
      });
    }
  }
  async getDetailsJobByCallNo(req, res) {
    const { callNo, callId } = req.params;
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("callId", sql.Int, callId)
      .input("callNo", sql.Int, callNo)
      .query(
        `SELECT * FROM [DB_PSDHELPDESK].[dbo].[V_HDALLJobs] WHERE call_subno = @callNo AND call_id = @callId`
      )
      .then((result, err) => {
        if (err) {
          return res.json({
            err: true,
            msg: err,
          });
        }
        if (result.recordset && result.recordset.length > 0) {
          return res.status(200).json({
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
        return res.json({ err: true, msg: err.message });
      });
  }
  async getInfoJobByCallId(req, res) {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Int, id)
      .query(
        `SELECT * FROM [DB_PSDHELPDESK].[dbo].[V_HDJobInfo] WHERE call_id = @id`
      )
      .then((result, err) => {
        if (err) {
          return res.json({
            err: true,
            msg: err,
          });
        }
        if (result.recordset && result.recordset.length > 0) {
          return res.status(200).json({
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
        return res.json({ err: true, msg: err.message });
      });
  }
  async addJob(req, res) {
    const {
      username,
      machineCode,
      machineName,
      codeUserAgent,
      title,
      hrc_info,
      category,
      details,
      processName,
    } = req.body;

    if (!title || !details || title == "" || details == "") {
      return res.json({
        err: true,
        msg: "Please fill out the information completely !",
      });
    }

    const images = req.files.images;

    const clientIP = IP.address();

    const pool = await sql.connect(sqlConfig);

    //Time for stop-start breakdown
    const datetimeNow =
      moment().add(7, "hours").format("YYYY-MM-DD HH:mm:ss") + ".000";

    const device1 = datetimeNow.split(" ")[1];

    // ไม่มี Hrc_Data return ทันที
    if (!hrc_info) {
      return res.json({
        err: true,
        msg: "HRC data error!",
      });
    }

    // เข้ารหัส Images Blob
    // const fileBuffer = images[0].buffer;
    // const fileHex = `0x${fileBuffer.toString("hex")}`;

    const callStatus = 28; // New Jobs
    const callRequest = 83; //Job Repair
    const jobType = "6";

    const callSubno = await FunctionInstance.getLastCallNo(); // สร้างเลข Job

    if (callSubno && callSubno.err == true) {
      return res.json({
        err: true,
        msg: "Error Genarate callNo!",
      });
    }

    const dataState =
      codeUserAgent !== "" && codeUserAgent !== null
        ? await FunctionInstance.GetDataMailContactInfo(codeUserAgent)
        : "";

    const dataHrc = JSON.parse(hrc_info); // Data ของ User ที่เข้าระบบ

    if (dataState == null) {
      // มีการส่งค่า Code User Agent แต่ไม่มีข้อมูลในระบบ GetDataMailContactInfo() จะ Return Null
      return res.json({
        err: true,
        msg: "User is not founded!",
        details: "ไม่พบข้อมูล Leader Code ในระบบ",
      });
    }

    const stringQuery = `INSERT INTO [DB_PSDHELPDESK].[dbo].[site_calls] ([call_subno],[call_subtitle],[call_first_name],[call_phone],[call_email],[call_department],[call_request],[call_device],[call_details],[call_status],[call_user],[call_device1],[call_device2],[call_device3],[call_problem_device],[call_uidvirus],[call_ip],[call_SourceGroupID],[call_Time1],[call_Time5]) 
      VALUES (@callSubno,@title,@fname,@phone,@email,@department,@callRequest,@callDevice,@details,@callStatus,@callUser,@device1,@device2,@device3,@deviceProblem,@uidVirus,@ip,@souceGroup,@time1,@time5)`;
    if (dataState == "" || !codeUserAgent) {
      // ไม่มีการส่งค่า Code User Agent
      try {
        const callUser = dataHrc.UHR_EmpCode;
        const callPhone = dataHrc.UHR_Phone;
        const callEmail = dataHrc.UHR_Email;
        const callDepartment = dataHrc.ESD_ShortDepartment;
        const callLeadercode = dataHrc.UHR_LeaderCode;
        const callFirstName = dataHrc.UHR_FullName_th;

        const insert = await pool
          .request()
          .input("callSubno", sql.NVarChar, callSubno.callSubNo)
          .input("title", sql.NVarChar, title)
          .input("fname", sql.NVarChar, callFirstName)
          .input("phone", sql.NVarChar, callPhone.toString())
          .input("email", sql.NVarChar, callEmail)
          .input("department", sql.NVarChar, callDepartment)
          .input("callRequest", sql.Int, parseInt(callRequest))
          .input("callDevice", sql.Int, parseInt(category))
          .input("details", sql.NVarChar, details)
          .input("callStatus", sql.Int, parseInt(callStatus))
          .input("callUser", sql.NVarChar, callUser)
          .input("device1", sql.NVarChar, processName) //ProcessName
          .input("device2", sql.NVarChar, `${device1}${device1}`) // Time Start Time Stop
          .input("device3", sql.NVarChar, machineCode) // MC Code
          .input("deviceProblem", sql.NVarChar, machineName) // MC Name
          .input("uidVirus", sql.NVarChar, username)
          .input("ip", sql.NVarChar, clientIP)
          .input("souceGroup", sql.NChar, jobType)
          .input("time1", sql.DateTime, datetimeNow)
          .input("time5", sql.DateTime, datetimeNow)
          .query(stringQuery);

        // Call Send E-mail function
        const sendMail = await FunctionInstance.sendMail(
          callSubno,
          callEmail,
          "PSD Helpdesk System",
          callUser,
          callLeadercode,
          title,
          details
        );

        if (sendMail) {
          //Success !
          return res.json({
            err: false,
            msg: "Add job !",
            result: insert,
          });
        }
      } catch (err) {
        return res.json({
          err: true,
          msg: err,
        });
      }
    } else if (dataState !== "" && dataState && dataState?.length > 0) {
      try {
        // แจ้งงานแทน
        const callUser = dataState[0].UHR_EmpCode;
        const callPhone = dataState[0].UHR_Phone;
        const callEmail = dataState[0].UHR_Email;
        const callDepartment = dataState[0].ESD_ShortDepartment;
        const callLeadercode = dataState[0].UHR_LeaderCode;
        const callFirstName = dataState[0].UHR_FullName_th;

        const insert = await pool
          .request()
          .input("callSubno", sql.NVarChar, callSubno.callSubNo)
          .input("title", sql.NVarChar, title)
          .input("fname", sql.NVarChar, callFirstName)
          .input("phone", sql.NVarChar, callPhone.toString())
          .input("email", sql.NVarChar, callEmail)
          .input("department", sql.NVarChar, callDepartment)
          .input("callRequest", sql.Int, parseInt(callRequest))
          .input("callDevice", sql.Int, parseInt(category))
          .input("details", sql.NVarChar, details)
          .input("callStatus", sql.Int, parseInt(callStatus))
          .input("callUser", sql.NVarChar, callUser)
          .input("device1", sql.NVarChar, processName) //ProcessName
          .input("device2", sql.NVarChar, `${device1}${device1}`) // Time Start Time Stop
          .input("device3", sql.NVarChar, machineCode) // MC Code
          .input("deviceProblem", sql.NVarChar, machineName) // MC Name
          .input("uidVirus", sql.NVarChar, username)
          .input("ip", sql.NVarChar, clientIP)
          .input("souceGroup", sql.NChar, jobType)
          .input("time1", sql.DateTime, datetimeNow)
          .input("time5", sql.DateTime, datetimeNow)
          .query(stringQuery);

        const sendMail = await FunctionInstance.sendMail(
          callSubno,
          callEmail,
          "PSD Helpdesk System",
          callUser,
          callLeadercode,
          title,
          details
        );

        if (sendMail) {
          //Success !
          return res.json({
            err: false,
            msg: "Add job !",
            status: "Ok",
            result: insert,
          });
        }
      } catch (err) {
        console.log(err);
        return res.json({
          err: true,
          msg: err,
          datetimeNow,
        });
      }
    }
    // await pool.request()
    //     .query(`INSERT INTO TEST_IMG (image) VALUES (${fileHex})`);

    // console.log('File uploaded to SQL Server successfully.');
    // res.status(200).send('File uploaded successfully.');
  }

  async updateJob(req, res) {
    try {
      const { call_subno } = req.params;
      const {
        callFname,
        assignName,
        idCategory,
        jobType,
        category,
        level,
        assignCode,
        StatusCode,
        followUp,
        dateStart,
        dateEnd,
        details,
        solveSolution,
        callUser,
      } = req.body;
      const pool = await sql.connect(sqlConfig);

      const result_job = await pool
        .request()
        .input("callSubNo", sql.Int, call_subno)
        .query(
          `SELECT * FROM [DB_PSDHELPDESK].[dbo].[V_HDJobInfo] WHERE [call_subno] = @callSubNo`
        );
      if (result_job && result_job.recordset.length > 0) {
        const typeReply =
          result_job.recordset[0].call_staff !== assignCode
            ? "50"
            : !details &&
              !solveSolution &&
              result_job.recordset[0].call_status !== StatusCode
            ? "44"
            : "44"; // 50 = ส่งมอบงานต่อ, 44 = เปลี่ยนสถานะ
        const typeResponsible =
          result_job.recordset[0].call_staff !== assignCode
            ? assignName
            : callFname;

        const callDetailsMore =
          !details &&
          !solveSolution &&
          result_job.recordset[0].call_status !== StatusCode
            ? "เปลี่ยนแปลงสถานะงาน"
            : details;

        const stmt_update = `UPDATE site_calls SET call_request = @callRequest,call_device = @callDevice,call_date2 = GETDATE(),
        call_status = @status,call_staff = @calLStaff,call_reply = @typeReply,call_remark2 = @level,call_remark3 = @followUp WHERE call_subno = @callSubNo`;

        console.log(req.body);
        // console.log(typeResponsible)
        // console.log(typeResponsible),
      } else {
        return res.json({
          err: true,
          msg: "Job is not founded!",
        });
      }

      console.log(req.body);
    } catch (error) {
      console.log(error);
    }
  }

  async getSolve(req, res) {
    const { subNo } = req.params;
    try {
      const pool = await sql.connect(sqlConfig);

      const result_job = await pool
        .request()
        .input("solve_relation", sql.NVarChar, subNo)
        .query(
          `SELECT type_name, solve_post_user, solve_details, solve_post_date,solve_reply_name FROM V_HDJobSolve WHERE solve_relation = @solve_relation`
        );
        if(result_job && result_job.recordset?.length > 0){
          return res.json({
            err:false,
            result:result_job.recordset
          })
        }else{
          return res.json({
            err:false,
            result:[]
          })
        }

    } catch (error) {
      console.log(error);
    }
  }
  async getCommentDetails(req, res) {
    const { subNo } = req.params;
    try {
      const pool = await sql.connect(sqlConfig);

      const result_job = await pool
        .request()
        .input("de_relation", sql.NVarChar, subNo)
        .query(
          `SELECT type_name, de_post_user, de_details, de_post_date,de_responsible FROM V_HDJobDetails WHERE (de_relation = @de_relation)`
        );

        if(result_job && result_job.recordset?.length > 0){
          return res.json({
            err:false,
            result:result_job.recordset
          })
        }else{
          return res.json({
            err:false,
            result:[]
          })
        }

    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = jobsController;
