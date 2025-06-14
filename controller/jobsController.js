const { sql, sqlConfig } = require("../config/connectDB");
const FunctionUtils = require("../utils/function");
const fs = require("fs");
const moment = require("moment/moment");
const IP = require("ip");

const FunctionInstance = new FunctionUtils();

class jobsController {
  async countJobs(req, res) {
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
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
          pool.close() ;
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
  async countJobsUser(req, res) {
    const empCode = req.params.code;
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
    await pool
      .request()
      .query(`EXEC [dbo].[SP_GetJobCountsForEmployee] @empCode = '${empCode}'`)
      .then((result, err) => {
        if (err) {
          console.log(err);
          return res.json({
            err: true,
            msg: err.msg,
          });
        }

        if (result.recordset && result.recordset.length > 0) {
          pool.close() ;
          return res.status(200).json({
            err: false,
            result: result.recordset,
            status: "Ok",
          });
        } else {
          pool.close() ;
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
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
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
    if (status !== "" && status !== undefined) {
      const strQuery = FunctionInstance.getStringQuery(status);
      if (strQuery !== undefined) {
        const pool = await new sql.ConnectionPool(sqlConfig).connect();
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
  }

  async getDetailsJobByStatusUser(req, res) {
    const { status, code } = req.params;
    if (
      status !== "" &&
      status !== undefined &&
      code !== "" &&
      code !== undefined
    ) {
      const strQuery = FunctionInstance.getStringQueryUsers(status);
      if (strQuery !== undefined) {
        const pool = await new sql.ConnectionPool(sqlConfig).connect();
        await pool
          .request()
          .input("EmpCode", sql.NVarChar, code)
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
  }

  async getDetailsJobByCallNo(req, res) {
    const { callNo, callId } = req.params;
    if (
      callNo !== "" &&
      callId !== "" &&
      callNo !== undefined &&
      callId !== undefined
    ) {
      const pool = await new sql.ConnectionPool(sqlConfig).connect();
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
  }
  async getInfoJobByCallId(req, res) {
    const { id } = req.params;
    if (id !== "" && id !== undefined) {
      const pool = await new sql.ConnectionPool(sqlConfig).connect();
      await pool
        .request()
        .input("id", sql.Int, parseInt(id))
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

    const images = req.files.images; // ไฟล์แนบ
    const clientIP = IP.address();
    const pool = await new sql.ConnectionPool(sqlConfig).connect();

    //Time for stop-start breakdown
    const datetimeNow =
      moment().add(7, "hours").format("YYYY-MM-DD HH:mm:ss") + ".000"; // .z+7

    const datetimeNowClient = moment().format("YYYY-MM-DD HH:mm:ss") + ".000";
    const device1 = datetimeNowClient.split(" ")[1];

    // ไม่มี Hrc_Data return ทันที
    if (!hrc_info) {
      return res.json({
        err: true,
        msg: "HRC data error!",
      });
    }

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
    const dataHrc = JSON.parse(hrc_info); // Data ของ User ที่เข้าระบบ
    const dataState = codeUserAgent && codeUserAgent !== "" && codeUserAgent !== null ? await FunctionInstance.GetDataMailContactInfo(codeUserAgent)
        : "";

    const stringQuery = `INSERT INTO [DB_PSDHELPDESK].[dbo].[site_calls] ([call_subno],[call_subtitle],[call_first_name],[call_phone],[call_email],[call_department],[call_request],[call_device],[call_details],[call_status],[call_user],[call_device1],[call_device2],[call_device3],[call_problem_device],[call_uidvirus],[call_ip],[call_SourceGroupID],[call_Time1],[call_Time5]) 
      VALUES (@callSubno,@title,@fname,@phone,@email,@department,@callRequest,@callDevice,@details,@callStatus,@callUser,@device1,@device2,@device3,@deviceProblem,@uidVirus,@ip,@souceGroup,@time1,@time5)`;
    if (dataState == "" && !codeUserAgent) {
      // ไม่มีการส่งค่า Code User Agent
      try {
        const callUser = dataHrc.UHR_EmpCode == "" || dataHrc.UHR_EmpCode == null ? "-": dataHrc.UHR_EmpCode;
        const callPhone = dataHrc.UHR_Phone == "" || dataHrc.UHR_Phone == null ? "-" : dataHrc.UHR_Phone;
        const callEmail = dataHrc.UHR_Email == "" || dataHrc.UHR_Email == null ? "-" : dataHrc.UHR_Email;
        const callDepartment = dataHrc.UHR_Department == "" || dataHrc.UHR_Department == null ? "-" : dataHrc.UHR_Department;
        const callLeadercode = dataHrc.UHR_LeaderCode == "" || dataHrc.UHR_LeaderCode == null ? "-":dataHrc.UHR_LeaderCode;
        const callFirstName = dataHrc.UHR_FullName_th == "" || dataHrc.UHR_FullName_th == null ? "-" :dataHrc.UHR_FullName_th;

        if (images !== undefined && images.length > 0) {
          const upload = await FunctionInstance.uploadFile(
            images,
            callSubno.callSubNo
          );

          if (!upload) {
            FunctionInstance.saveLogsAction(
              callSubno.callSubNo,
              "อัพโหลดรูปภาพไม่สำเร็จ",
              "Upload",
              clientIP
            ); // เก็บ Logs

            return res.json({
              err: true,
              msg: "Error ! Upload files ",
            });
          }
        }

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

        // Upload File Binary เข้ารหัส Images Blob

        // FunctionInstance.sendMail(
        //   callSubno.callSubNo,
        //   callEmail,
        //   "PSD Helpdesk System",
        //   callUser,
        //   callLeadercode,
        //   title,
        //   details,
        //   clientIP
        // );

        //Success !
        return res.json({
          err: false,
          msg: "Add job !",
          result: insert,
          status: "Ok",
        });
      } catch (err) {
        console.log(images);
        return res.json({
          err: true,
          msg: err,
        });
      }
    } else if (dataState !== "" && dataState && dataState?.length > 0) {
      // แจ้งงานแทน

      try {
        const callUser =
          dataState[0].UHR_EmpCode == null ? "-" : dataState[0].UHR_EmpCode;
        const callPhone =
          dataState[0].UHR_Phone == null ? "-" : dataState[0].UHR_Phone;
        const callEmail =
          dataState[0]?.UHR_Email == null ? "-" : dataState[0]?.UHR_Email;
        const callDepartment =
          dataState[0].UHR_Department == null
            ? "-"
            : dataState[0].UHR_Department;
        const callLeadercode =
          dataState[0].UHR_LeaderCode == null
            ? "-"
            : dataState[0].UHR_LeaderCode;
        const callFirstName =
          dataState[0].UHR_FullName_th == null
            ? "-"
            : dataState[0].UHR_FullName_th;

           
        if (images !== undefined && images.length > 0) {
          // Upload File Binary เข้ารหัส Images Blob
          const upload = await FunctionInstance.uploadFile(
            images,
            callSubno.callSubNo
          );
  
          if (!upload) {
  
            FunctionInstance.saveLogsAction(callSubno.callSubNo,'อัพโหลดรูปภาพไม่สำเร็จ','Upload',clientIP) // เก็บ Logs
  
            return res.json({
              err: true,
              msg: "Error ! Upload files ",
            });
  
          }
        }
  
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
  
        // ส่งอีเมล
          FunctionInstance.sendMail(
          callSubno.callSubNo,
          callEmail,
          "PSD Helpdesk System",
          callUser,
          callLeadercode,
          title,
          details,
          clientIP
        );

        // ส่ง Response Json to client !
        return res.json({
          err: false,
          msg: "Add job !",
          status: "Ok",
          result: insert,
        });
        
      } catch (err) {
        console.log(images);
        return res.json({
          err: true,
          msg: err,
        });
      }
    }
  }

  async updateJob(req, res) {
    try {
      const { call_subno } = req.params;
      const {
        callFname,
        assignName,
        jobType,
        assignCode,
        StatusCode,
        followUp,
        details,
        solveSolution,
        dateTime1,
        dateTime5,
        dePost,
        analysis,
        suggustion,
        reasonFollowUp,
        idCategory,
        rank,
      } = req.body;
      const pool = await new sql.ConnectionPool(sqlConfig).connect();

      const result_job = await pool
        .request()
        .input("callSubNo", sql.Int, call_subno)
        .query(`SELECT * FROM [V_HDJobInfo] WHERE [call_subno] = @callSubNo`);

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

        const pool = await new sql.ConnectionPool(sqlConfig).connect();
        const update = await pool
          .request()
          .input("callRequest", sql.Int, jobType)
          .input("callDevice", sql.Int, idCategory)
          .input("status", sql.Int, StatusCode)
          .input("callStaff", sql.NVarChar, assignCode)
          .input("typeReply", sql.Int, typeReply)
          .input("rank", sql.NVarChar, rank)
          .input("followUp", sql.NVarChar, followUp)
          .input("callSubNo", sql.Int, call_subno)
          .input("analysis", sql.NVarChar, analysis)
          .input("Suggustion", sql.NVarChar, suggustion)
          .input("AboutFollowUp", sql.NVarChar, reasonFollowUp)
          .input(
            "date1",
            sql.DateTime,
            moment(dateTime1).add(7, "hours").format("YYYY-MM-DD HH:mm:ss") +
              ".000"
          )
          .input(
            "date5",
            sql.DateTime,
            moment(dateTime5).add(7, "hours").format("YYYY-MM-DD HH:mm:ss") +
              ".000"
          )
          .query(`UPDATE site_calls SET call_request = @callRequest,call_device = @callDevice,call_date2 = GETDATE(),
        call_status = @status,call_staff = @callStaff,call_reply = @typeReply,call_remark2 = @rank,
        call_remark3 = @followUp,call_remark4 = @analysis,call_remark5 = @Suggustion,call_remark6 = @AboutFollowUp,call_Time1 = @date1,call_Time5 = @date5 WHERE call_subno = @callSubNo`);

        const insertDetails = await pool
          .request()
          .input("callDetailsMore", sql.NVarChar, callDetailsMore)
          .input("subCallNo", sql.NVarChar, call_subno)
          .input("dePost", sql.NVarChar, dePost)
          .input("typeReply", sql.NVarChar, typeReply)
          .input("typeResponsible", sql.NVarChar, typeResponsible)
          .query(`INSERT INTO site_details 
        ([de_details],[de_relation],[de_post_date],[de_post_user],[de_reply_name],[de_responsible]) 
        VALUES (@callDetailsMore,@subCallNo,GETDATE(),@dePost,@typeReply,@typeResponsible)`);

        const insertSolve = await pool
          .request()
          .input("callSolve", sql.NVarChar, solveSolution)
          .input("subCallNo", sql.NVarChar, call_subno)
          .input("dePost", sql.NVarChar, dePost)
          .input("typeReply", sql.NVarChar, typeReply)
          .query(`INSERT INTO site_solve 
        ([solve_details],[solve_relation],[solve_post_date],[solve_post_user],[solve_reply_name]) 
        VALUES (@callSolve,@subCallNo,GETDATE(),@dePost,@typeReply)`);

        if (update && insertDetails && insertSolve) {
          return res.json({ err: false, msg: "Updated!", status: "Ok" });
        }
      } else {
        return res.json({
          err: true,
          msg: "Job is not founded!",
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getSolve(req, res) {
    const { subNo } = req.params;
    if (subNo !== "" && subNo !== undefined) {
      try {
        const pool = await new sql.ConnectionPool(sqlConfig).connect();

        const result_job = await pool
          .request()
          .input("solve_relation", sql.NVarChar, subNo)
          .query(
            `SELECT type_name, solve_post_user, solve_details, solve_post_date,solve_reply_name FROM V_HDJobSolve WHERE solve_relation = @solve_relation`
          );
        if (result_job && result_job.recordset?.length > 0) {
          return res.json({
            err: false,
            result: result_job.recordset,
          });
        } else {
          return res.json({
            err: false,
            result: [],
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  async getCommentDetails(req, res) {
    const { subNo } = req.params;
    if (subNo !== "" && subNo !== undefined) {
      try {
        const pool = await new sql.ConnectionPool(sqlConfig).connect();

        const result_job = await pool
          .request()
          .input("de_relation", sql.NVarChar, subNo)
          .query(
            `SELECT type_name, de_post_user, de_details, de_post_date,de_responsible FROM V_HDJobDetails WHERE (de_relation = @de_relation)`
          );

        if (result_job && result_job.recordset?.length > 0) {
          return res.json({
            err: false,
            result: result_job.recordset,
          });
        } else {
          return res.json({
            err: false,
            result: [],
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async getDetailsJobByDate(req, res) {
    const { start,end } = req.params;
 
    
    
    if (start || end) {
        const strQuery = `SELECT [call_id],[call_subno],[call_date],[call_request],[call_subtitle],[call_problem_device],
  [call_user],[call_status],[call_date2],[call_device],[call_usercode],[call_department] FROM [dbo].V_HDALLJobs 
  WHERE [call_date2] BETWEEN @start AND @end
  ORDER BY call_date2 DESC, call_date DESC` ;
      
        const pool = await new sql.ConnectionPool(sqlConfig).connect();
        await pool
          .request()
          .input("start",sql.DateTime,start)
          .input("end",sql.DateTime,end)
          .query(strQuery)
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
     
    }else{
      return res.json({err : true, msg : "Params is required!"})
    }
  }

}

module.exports = jobsController;
