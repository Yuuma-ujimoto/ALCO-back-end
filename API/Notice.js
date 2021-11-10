const express = require("express")
const router = express.Router()
const mysql = require("mysql2/promise")
const mysql_config = require("../config/mysql")
const AuthAndGetUserData = require("../component/AuthAndGetUserData")

router.get("/count",
    async (req, res) => {
        const UserData = await AuthAndGetUserData(req)
        if (UserData.ClientError || UserData.ServerError) {
            res.json(UserData)
            return
        }
        const connection = await mysql.createConnection(mysql_config)
        try {
            const SelectLastAccessSQL = "select access_time from last_access where user_id = ?"
            const [SelectLastAccessResult,] = await connection.query(SelectLastAccessSQL,[UserData.UserId])
            console.log(!SelectLastAccessResult)
            if (!SelectLastAccessResult.length) {
                const SelectAllNoticeSQL = "select count(*) as count from notice where receive_user_id = ?"
                const [SelectAllNoticeResult,] = await connection.query(SelectAllNoticeSQL,[UserData.UserId])
                console.log(SelectAllNoticeResult)
                res.json({
                    ServerError: false,
                    ClientError: false,
                    NoticeCount: SelectAllNoticeResult[0].count
                })
                return
            }
            const SelectUnreadNoticeSQL = "Select count(*) as count from notice where receive_user_id = ? and created_at > ?"
            const [SelectUnreadNoticeResult,] = await connection.query(SelectUnreadNoticeSQL,[UserData.UserId,SelectLastAccessResult.access_time])
            res.json({
                ServerError: false,
                ClientError: false,
                NoticeCount: SelectUnreadNoticeResult[0].count
            })
        }
        catch (e) {
            console.log(e)
            res.json({
                ServerError:true,
                ClientError:false,
                Message:"サーバーエラー"
            })
        }
        finally {
            await connection.end()
        }

    })

router.get("/show",
    async (req, res) => {
    const Userdata = await AuthAndGetUserData(req)
        if (Userdata.ServerError||Userdata.ClientError){
            res.json(Userdata)
            return
        }
        const connection = await mysql.createConnection(mysql_config)
        try {
            const SelectLastAccessSQL = "select access_time as LastAccessTime from last_access where user_id = ?"
            const [SelectLastAccessResult,] = await connection.query(SelectLastAccessSQL,[Userdata.UserId])


            const SelectNoticeSQL = "select * from notice where receive_user_id = ? order by notice_id desc limit 100"
            const [SelectNoticeResult,] = await connection.query(SelectNoticeSQL,[Userdata.UserId])

            // 最終アクセス時刻データが存在しない場合Insert
            // 存在する場合はUpdateかける
            if (!SelectLastAccessResult.length){
                const InsertLastAccessSQL = "Insert into last_access(user_id,access_time) values(?,current_timestamp)"
                await connection.query(InsertLastAccessSQL,[Userdata.UserId])
            }
            else {
                const UpdateLastAccessSQL = "update last_access set access_time = current_timestamp where user_id = ?"
                await connection.query(UpdateLastAccessSQL,[Userdata.UserId])
            }
            console.log(SelectLastAccessResult)
            res.json({
                ServerError:false,
                ClientError:false,
                NoticeResult : SelectNoticeResult,
                LastAccessTime:SelectLastAccessResult.LastAccessTime
            })
        }
        catch (e){
            console.log(e)
            res.json({
                ServerError:true,
                ClientError:false,
                Message:"サーバーエラー"
            })
        }
        finally {
            await connection.end()
        }
})

module.exports = router