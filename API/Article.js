const express = require("express")
const router = express.Router()
const mysql = require("mysql2/promise")
const mysql_config = require("../config/mysql")
const AuthAndGetUserData = require("../component/AuthAndGetUserData")
router.post("/",
    async (req, res) => {
    const UserData = await AuthAndGetUserData(req)
        if (UserData.ServerError||UserData.ClientError){
            res.json(UserData)
            return
        }
        let {
            ArticleTitle=null,
            ArticleText=null,
            ArticleTag=null
        } = req.body

        if (!Array.isArray(ArticleTag)){
            ArticleTag = [ArticleTag]
        }

        const connection = await mysql.createConnection(mysql_config)
        try {


            const InsertArticleSQL = "insert into article(user_id,article_text) values(?,?)"
            const InsertArticleStatement = []
            await connection.query(InsertArticleSQL,InsertArticleStatement)
            for (let tag of ArticleTag){
                //

            }
        }catch (e) {
            console.log(e)
        }

})
