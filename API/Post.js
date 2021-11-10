const express = require("express")
const router = express.Router()
const mysql = require("mysql2/promise")
const mysql_config = require("../config/mysql")

const AuthAndGetUserData = require("../component/AuthAndGetUserData")
const SaveImage = require("../component/SaveImage")


/*
    MEMO:
     投稿の処理の流れ
     画像保存　
     投稿DB insert
     投稿画像DB　insert
*/

router.post("/",
    async (req, res, next) => {
        const AuthResult = await AuthAndGetUserData(req)
        if (AuthResult.ServerError || AuthResult.ClientError) {
            res.json(AuthResult)
            return
        }
        const UserId = AuthResult.UserId
        const {PostText=null} = req.body
        if (!PostText){
            res.json({
                ServerError:false,
                ClientError:true,
                Message:"データ不足"
            })
            return
        }
        let ImageFiles = req.files.PostImage
        console.log(ImageFiles)
        // 強制的に配列に変換
        if (!Array.isArray(ImageFiles)) {
            ImageFiles = [ImageFiles]
        }
        console.log(ImageFiles)
        // MEMO:ここら辺の変数名後で混同しないように気をつける
        let SavedImageFilePathArray = []
        let SaveImageResult
        for (let ImageFile of ImageFiles) {
            console.log("*******************")
            console.log(ImageFile)
            SaveImageResult = await SaveImage(ImageFile)
            //エラー出た場合
            if (SaveImageResult.ServerError || SaveImageResult.ClientError) {
                res.json(SaveImageResult)
                return
            }
            SavedImageFilePathArray.push(SaveImageResult.ImageFilePath)
        }
        const connection = await mysql.createConnection(mysql_config)
        try {
            const InsertPostDataSQL = "insert into post(post_text,user_id) values(?,?)"
            await connection.query(InsertPostDataSQL, [PostText, UserId])

            // As post_id　要らなかった気もするけど念の為
            const SelectPostIdSQL = "select max(post_id) as post_id from post where post_text = ? and user_id = ? and is_deleted = 0"
            const [SelectPostIdResult,] = await connection.query(SelectPostIdSQL, [PostText, UserId])

            const PostId = SelectPostIdResult[0].post_id

            /*
            MEMO:
                絶対Pathにしたことでフロント側での処理が楽になったけど
                S3に移行するとしたら結構めんどくさいことなりそう
                ->S3の移行タイミングでリセットかけてもいいかも
                ->S3移行時にRDSの移行もセットでやってそのタイミングでリセットすればいいかも
             */

            const InsertPostImageSQL = "insert into  post_image(post_id,image_url) values(?,?)"
            for (let SavedImageFilePath of SavedImageFilePathArray) {
                await connection.query(InsertPostImageSQL, [PostId, SavedImageFilePath])
            }

            res.json({
                ServerError:false,
                ClientError:false
            })

        } catch (e) {
            console.log(e)
            return {
                ServerError: true,
                ClientError: false,
                Message: "データベースエラー"
            }
        } finally {
            await connection.end()
        }
    })

router.post("/reply",
    async (req, res) => {
    const UserData = await AuthAndGetUserData(req)
        if (UserData.ServerError||UserData.ServerError){
            res.json(UserData)
            return
        }
        const {
            PostId=null,
            ReplyText=null
        }= req.body
        if (!PostId||!ReplyText){
            res.json({
                ServerError:false,
                ClientError:true,
                Message:"パラメーター不足"
            })
            return
        }
        const connection = await mysql.createConnection(mysql_config)
        try {
            const InsertReplySQL = "insert into post_reply(post_id,user_id,post_reply_text) values(?,?,?)"
            const InsertReplyStatement = [PostId, UserData.UserId, ReplyText]
            await connection.query(InsertReplySQL,InsertReplyStatement)

            const InsertNoticeSQL =
                "insert into notice(send_user_id,notice_link,notice_text,receive_user_id) values(?,?,?,(select user_id from post where post_id = ?)) "
            const InsertNoticeStatement = [
                UserData.UserId,
                "あなたの投稿に返信が付きました。",
                "/post/status/"+PostId,
                PostId
            ]
            await connection.query(InsertNoticeSQL,InsertNoticeStatement)

            res.json({
                ServerError:false,
                ClientError:false
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



router.post("/favorite",
    async (req, res) => {
    const UserData = await AuthAndGetUserData(req)
        if (UserData.ServerError||UserData.ClientError){
            res.json(UserData)
        }
        const connection = await mysql.createConnection(mysql_config)

        const {PostId} = req.body
        if (!PostId){
            res.json({
                ServerError:false,
                ClientError:true,
                Message:"パラメーター不足"
            })
            return
        }
        try {
            const CheckFavoriteSQL = "select count(*) as count from post_favorite where user_id = ? and post_id = ? and is_deleted = 0"
            const [CheckFavoriteResult,] = await connection.query(CheckFavoriteSQL, [UserData.UserId, PostId])

            if (CheckFavoriteResult[0].count) {
                const DeleteFavoriteSQL = "update post_favorite set is_deleted = 1 where user_id = ? and post_id = ?"
                await connection.query(DeleteFavoriteSQL, [UserData.UserId, PostId])
                res.json({
                    ServerError: false,
                    ClientError: false,
                    Type: "Delete"
                })
                return
            }
            const InsertFavoriteSQL = "insert into post_favorite(user_id,post_id) values(?,?)"
            await connection.query(InsertFavoriteSQL, [UserData.UserId, PostId])

            const InsertNoticeSQL = "insert into notice(send_user_id,notice_link,notice_text,receive_user_id) values(?,?,?,(select user_id from post where post_id = ?)) "
            const InsertNoticeStatement = [
                UserData.UserId,
                "/post/status/"+PostId,
                "投稿にいいねが付きました。",
                PostId
            ]
            await connection.query(InsertNoticeSQL,InsertNoticeStatement)

            res.json({
                ServerError: false,
                ClientError: false,
                Type: "Insert"
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