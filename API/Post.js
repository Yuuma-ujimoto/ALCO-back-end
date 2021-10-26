const express = require("express")
const router = express.Router()
const mysql = require("mysql2/promise")
const mysql_config = require("../config/mysql")

const AuthAndGetUserData = require("../component/AuthAndGetUserData")
const SaveImage = require("../component/SaveImage")


// 投稿フロー
// 画像保存
// 投稿DB insert
// 投稿画像DB　insert

router.post("/", async (req, res, next) => {
    const AuthResult = AuthAndGetUserData(req)
    if (AuthResult.ServerError || AuthResult.ClientError) {
        res.json(AuthResult)
    }
    const UserId = AuthResult.UserId
    const {PostText} = req.body
    let ImageFiles = req.files.PostImage

    // 強制的に配列に変換
    if (!Array.isArray(ImageFiles)) {
        ImageFiles = [ImageFiles]
    }
    let SavedImageFilePath = []
    let SaveImageResult
    for (let ImageFile of ImageFiles) {
        SaveImageResult = await SaveImage(ImageFiles[ImageFile])
        //エラー出た場合
        if (SaveImageResult.ServerError || SaveImageResult.ClientError) {
            res.json(SaveImageResult)
            return
        }
        SavedImageFilePath.push(SaveImageResult.ImageFilePath)
    }
    const connection = await mysql.createConnection(mysql_config)
    try {
        const InsertPostDataSQL = "insert into post(post_text,user_id) values(?,?)"
        await connection.query(InsertPostDataSQL, [PostText, UserId])

        // As post_id　要らなかった気もするけど念の為
        const SelectPostIdSQL = "select max(post_id) as post_id from post where post_text = ? and user_id = ? and is_deleted = 0"
        const [SelectPostIdResult,] = await connection.query(SelectPostIdSQL,[PostText,UserId])

        const PostId = SelectPostIdResult[0].post_id



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


module.exports = router