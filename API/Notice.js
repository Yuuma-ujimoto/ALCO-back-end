const express = require("express")
const router = express.Router()
const mysql = require("mysql2/promise")
const mysql_config = require("../config/mysql")
const AuthAndGetUserData = require("../component/AuthAndGetUserData")

router.get("/check",
    async (req, res) => {
        const UserData = await AuthAndGetUserData(req)
        if (UserData.ClientError || UserData.ServerError) {
            res.json(UserData)
            return
        }
        const connection = await mysql.createConnection(mysql_config)
        const SelectLastAccessSQL = "Select access_time from last_access　where user_id = ?"
        const [SelectLastAccessResult,] = await connection.query(SelectLastAccessSQL)
        if (!!SelectLastAccessResult.access_time){

        }
        const SelectUnreadNoticeSQL = "Select count(*) from notice where user_id = ? and created_at > (Select access_time from last_access where user_id = ?)"
    })