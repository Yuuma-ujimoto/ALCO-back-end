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
            "from post_favorite where is_deleted = 0 " +
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
            if (EditedPostFavoriteResult.ServerError || EditedPostFavoriteResult.ClientError) {
                res.json(EditedPostFavoriteResult)
                return
            }
            const EditedPostImageResult = SetImageResult(SelectPostImageResult)

            if (EditedPostImageResult.ServerError || EditedPostImageResult.ClientError) {
                res.json(EditedPostImageResult)
                return
            }

            const getMyFavoriteResult = await GetMyFavorite(AuthAndGetUserResult.UserId)
            if (getMyFavoriteResult.ServerError || getMyFavoriteResult.ClientError) {
                res.json(getMyFavoriteResult)
                return
            }
            res.json({
                ServerError: false,
                ClientError: false,
                PostResult: SelectPostResult,
                PostImageResult: EditedPostImageResult.Result,
                ReplyResult: EditedPostReplyResult.Result,
                FavoriteResult: EditedPostFavoriteResult.Result,
                MyFavoriteResult: getMyFavoriteResult.FavoriteResult
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


router.get("/status",
    async (req, res) => {
        const UserData = await AuthAndGetUserData(req)
        if (UserData.ServerError || UserData.ClientError) {
            res.json(UserData)
            return
        }
        const {PostId = null} = req.query
        const connection = await mysql.createConnection(mysql_config)
        try {
            const CheckExistPostSQL =
                "select count(*) as count " +
                "from post P " +
                "inner join user U " +
                "on P.user_id = U.user_id " +
                "where P.post_id = ? and P.is_deleted = 0 and U.is_deleted = 0"
            const [CheckExistPostResult,] = await connection.query(CheckExistPostSQL, [PostId])
            console.log(CheckExistPostResult)
            if (!CheckExistPostResult[0].count) {
                res.json({
                    ServerError: false,
                    ClientError: true,
                    Message: "存在しない投稿"
                })
                return
            }
            const SelectPostStatusSQL =
                "select " +
                "P.post_id as PostId," +
                "P.post_text as PostText," +
                "P.created_at as CreatedAt," +
                "U.account_name as AccountName," +
                "U.display_name as DisplayName " +
                "from post P " +
                "inner join user U " +
                "on P.user_id = U.user_id " +
                "where P.post_id = ? and  P.is_deleted = 0 and U.is_deleted = 0"

            const SelectFavoriteCountSQL =
                "select count(*) as FavCount " +
                "from post_favorite " +
                "where post_id = ? and is_deleted = 0"

            const SelectReplySQL =
                "select R.post_reply_text as PostReplyText," +
                " U.account_name as AccountName ," +
                " U.display_name as DisplayName " +
                "from post_reply R " +
                "inner join user U " +
                "on R.user_id = U.user_id " +
                "where R.post_id = ? and R.is_deleted = 0 and U.is_deleted = 0"

            const SelectPostImageSQL =
                "select image_url as ImageUrl " +
                "from post_image " +
                "where post_id = ? and is_deleted = 0"

            const SelectMyFavoriteSQL =
                "select count(*) as count from post_favorite where user_id = ? and post_id = ? and is_deleted = 0"
            const [SelectPostStatusResult,] = await connection.query(SelectPostStatusSQL,[PostId])
            const [SelectPostImageResult] = await connection.query(SelectPostImageSQL,[PostId])
            const [SelectFavoriteCountResult,] = await connection.query(SelectFavoriteCountSQL,[PostId])
            const [SelectReplyResult,] = await connection.query(SelectReplySQL,[PostId])
            const [SelectMyFavoriteResult,] = await connection.query(SelectMyFavoriteSQL,[UserData.UserId,PostId])

            console.log(SelectPostImageResult)
            let EditedPostImageResult = []
            for (let PostImage of SelectPostImageResult ){
                console.log(PostImage.ImageUrl)
                EditedPostImageResult.push(PostImage.ImageUrl)
            }
            console.log(EditedPostImageResult)
            res.json({
                PostStatusResult: SelectPostStatusResult[0],
                PostImageResult:EditedPostImageResult,
                FavoriteCount: SelectFavoriteCountResult[0].count,
                ReplyResult: SelectReplyResult,
                IsMyFavorite: !!SelectMyFavoriteResult[0].count
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

router.get("/userPost")

router.get("/status/reply")


module.exports = router