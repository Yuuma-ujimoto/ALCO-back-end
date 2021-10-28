const express = require("express")
const router = express.Router()
const mysql = require("mysql2/promise")
const mysql_config = require("../config/mysql")

const AuthAndGetUserData = require("../component/AuthAndGetUserData")

const SetReplyResult = require("../component/Post/SetReplyResult")
const SetFavoriteResult = require("../component/Post/SetFavoriteResult")
//グローバルタイムライン
router.get("/global",
    async (req, res) => {
        const AuthAndGetUserResult = await AuthAndGetUserData(req)
        if (AuthAndGetUserResult.ServerError||AuthAndGetUserResult.ClientError){
            res.json(AuthAndGetUserResult)
            return
        }
        const SelectPostSQL =
            "select P.post_id,P.post_text,P.created_at,U.account_name,U.display_name " +
            "from post P " +
            "inner join user U " +
            "on P.user_id = U.user_id " +
            "where P.is_deleted = 0 " +
            "order by P.post_id desc " +
            "limit 100 "

        const SelectPostReplySQL =
            "select PR.post_reply_text,U.account_name,U.display_name"+
            "from post_reply PR " +
            "inner join user U " +
            "on PR.user_id = U.user_id " +
            "where PR.post_id in " +
            "(select post_id from post where is_deleted = 0 order by post_id desc limit 100)"

        const SelectPostFavoriteSQL =
            "select count(*) as count,post_id from post_favorite group by post_id order by desc limit 100"

        const connection = await mysql.createConnection(mysql_config)
        try {


            const SelectPostResult = await connection.query(SelectPostSQL)
            const SelectPostReplyResult = await connection.query(SelectPostReplySQL)
            const SelectPostFavoriteResult = await connection.query(SelectPostFavoriteSQL)

            const EditedPostReplyResult = SetReplyResult(SelectPostReplyResult)
            const EditedPostFavoriteResult = SetFavoriteResult(SelectPostFavoriteResult)

            res.json({
                ServerError:false,
                ClientError:false,
                PostResult:SelectPostResult,
                ReplyResult:EditedPostReplyResult,
                FavoriteResult:EditedPostFavoriteResult
            })
        }catch (e) {
            console.log(e)
            res.json({
                ServerError:true,
                ClientError:false,
                Message:"サーバーエラー"
            })
        }finally {
            await connection.end()
        }
})

router.get("/local")

router.get("/status")

router.get("/status/reply")


module.exports = router