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

router.post("/reply")

router.post("/favorite")



module.exports = router