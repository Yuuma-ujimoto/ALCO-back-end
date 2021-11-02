const express = require("express")
const router = express.Router()
const mysql = require("mysql2/promise")
const mysql_config = require("../config/mysql")

const AuthAndGetUserData = require("../component/AuthAndGetUserData")

const SetReplyResult = require("../component/Post/SetReplyResult")
const SetFavoriteResult = require("../component/Post/SetFavoriteResult")
const SetImageResult = require("../component/Post/SetImageResut")
const GetMyFavorite = require("../component/Post/GetMyFavoritePost")
//グローバルタイムライン
router.get("/global",
    async (req, res) => {
        const AuthAndGetUserResult = await AuthAndGetUserData(req)
        if (AuthAndGetUserResult.ServerError || AuthAndGetUserResult.ClientError) {
            res.json(AuthAndGetUserResult)
            return
        }
        const SelectPostSQL =
            "select " +
            "P.post_id as PostId," +
            "P.post_text as PostText," +
            "P.created_at as CreatedAt," +
            "U.account_name as AccountName," +
            "U.display_name as DisplayName " +
            "from post P " +
            "inner join user U " +
            "on P.user_id = U.user_id " +
            "where P.is_deleted = 0 " +
            "order by P.post_id desc " +
            "limit 100 "

        const SelectPostImageSQL =
           "select " +
            "PI.image_url as ImageUrl," +
            "PI.post_id PostId " +
            "from " +
            "post_image PI " +
            "inner join " +
            "post P " +
            "on " +
            "PI.post_id = P.post_id " +
            "where " +
            "P.is_deleted = 0 " +
            "and " +
            "PI.is_deleted = 0 " +
            "and " +
            "EXISTS (select post_id from post where is_deleted = 0 limit 100)"

        const SelectPostReplySQL =
            "select PR.post_reply_text as PostReplyText," +
            "PR.post_id as PostId," +
            "U.account_name as AccountName," +
            "U.display_name as DisplayName " +
            "from post_reply PR " +
            "inner join user U " +
            "on PR.user_id = U.user_id " +
            "where U.is_deleted = 0 and PR.is_deleted = 0 order by PR.post_id desc limit 100"

        const SelectPostFavoriteSQL =
            "select count(*) as FavCount,post_id as PostId " +
            "from post_favorite " +
            "group by post_id " +
            "order by post_id desc limit 100"


        const connection = await mysql.createConnection(mysql_config)
        try {

            const [SelectPostResult,] = await connection.query(SelectPostSQL)
            const [SelectPostReplyResult,] = await connection.query(SelectPostReplySQL)
            const [SelectPostFavoriteResult,] = await connection.query(SelectPostFavoriteSQL)
            const [SelectPostImageResult,] = await connection.query(SelectPostImageSQL)
            const EditedPostReplyResult = SetReplyResult(SelectPostReplyResult)
            if (EditedPostReplyResult.ServerError || EditedPostReplyResult.ClientError) {
                res.json(EditedPostReplyResult);
                return
            }

            const EditedPostFavoriteResult = SetFavoriteResult(SelectPostFavoriteResult)
            if (EditedPostFavoriteResult.ServerError||EditedPostFavoriteResult.ClientError){
                res.json(EditedPostFavoriteResult)
                return
            }
            const EditedPostImageResult = SetImageResult(SelectPostImageResult)

            if (EditedPostImageResult.ServerError||EditedPostImageResult.ClientError){
                res.json(EditedPostImageResult)
                return
            }

            const getMyFavoriteResult = await GetMyFavorite(AuthAndGetUserResult.UserId)
            if (getMyFavoriteResult.ServerError||getMyFavoriteResult.ClientError){
                res.json(getMyFavoriteResult)
                return
            }
            res.json({
                ServerError: false,
                ClientError: false,
                PostResult: SelectPostResult,
                PostImageResult:EditedPostImageResult.Result,
                ReplyResult: EditedPostReplyResult.Result,
                FavoriteResult: EditedPostFavoriteResult.Result,
                MyFavoriteResult:getMyFavoriteResult.FavoriteResult
            })
        } catch (e) {
            console.log(e)
            res.json({
                ServerError: true,
                ClientError: false,
                Message: "サーバーエラー"
            })
        } finally {
            await connection.end()
        }
    })



router.get("/local")

router.get("/status")

router.get("/userPost")

router.get("/status/reply")


module.exports = router