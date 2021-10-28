const express = require("express")
const router = express.Router()
const mysql = require("mysql2/promise")
const mysql_config = require("../config/mysql")

const isOverlappingMailAddress = require("../component/IsOverlappingMailAddress")
const isOverlappingAccountName = require("../component/IsOverlappingAccountName")
const hashString = require("../component/hashString")
//ユーザー登録
router.post("/SignUp",
    async (req, res, next) => {
        //分割代入でデフォルト値入れとくことで存在しない値を取得した際にエラーを回避
        const {
            AccountName = null,    //アカウント名
            DisplayName = null,    //表示名
            MailAddress = null,    //メールアドレス
            Password = null,       //パスワード
            ConfirmPassword = null,//確認用パスワード
            BirthdateYear = null,  //生年月日　年
            BirthdateMonth = null, //生年月日　月
            BirthdateDate = null   //生年月日　日
        } = req.body

        if (!AccountName || !DisplayName || !MailAddress || !Password || !ConfirmPassword ||
            !BirthdateYear || !BirthdateMonth || !BirthdateDate) {
            res.json({
                ServerError: false,
                ClientError: true,
                Message: "パラメーターが足りません。"
            })
            return
        }


        const connection = await mysql.createConnection(mysql_config)

        const CheckMailAddress = await isOverlappingMailAddress(MailAddress)
        if (CheckMailAddress.error) {
            res.json({
                ServerError: true,
                ClientError: false,
                Message: "サーバーエラー"
            })
            return
        }
        if (CheckMailAddress.overlapping) {
            res.json({
                ServerError: false,
                ClientError: true,
                Message: "すでに登録されているメールアドレスです。"
            })
            return
        }

        const CheckAccountName = await isOverlappingAccountName(AccountName)

        if (CheckAccountName.error) {
            res.json({
                ServerError: true,
                ClientError: false,
                Message: "サーバーエラー"
            })
            return
        }
        if (CheckAccountName.overlapping) {
            res.json({
                ServerError: false,
                ClientError: true,
                Message: "すでに登録されているアカウント名です。"
            })
            return
        }

        // ここら辺でパスワードのHash化

        const HashedPassword = hashString(Password)
        const BirthDay = `${BirthdateYear}-${BirthdateMonth}-${BirthdateDate}`
        try {


            const InsertUserDataSQL = "insert into user(account_name,display_name,mail_address,password,birth_day)"
            const InsertUserDataStatement = [AccountName, DisplayName, MailAddress, HashedPassword, BirthDay]
            await connection.query(InsertUserDataSQL, InsertUserDataStatement)

            const Token = hashString(MailAddress+AccountName)

            const InsertTokenSQL = "insert into token(user_id,user_token) value((" +
                "select user_id from user where mail_address = ? and password = ? and is_deleted = 0" +
                "),?)"
            const InsertTokenStatement = [MailAddress, Password, Token]

            await connection.query(InsertTokenSQL, InsertTokenStatement)

            res.json({
                ServerError: false,
                ClientError: false,
                Token: Token
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

router.post("/SignIn",
    async (req, res) => {
        const {
            MailAddress = null,
            Password = null
        } = req.body

        if (!MailAddress || !Password) {
            res.json({
                ServerError: false,
                ClientError: true,
                Message: "パラメーターが足りません。"
            })
        }
        const HashPassword = hashString(Password)
        const connection = await mysql.createConnection(mysql_config)
        try {
            const SignInSQL = "select count(*) as count from user where mail_address = ? and password = ? and is_deleted = 0"

            const [SignInResult,] = await connection.query(SignInSQL,[MailAddress,HashPassword])
            if (!SignInResult[0].count){
                res.json({
                    ServerError:false,
                    ClientError:true,
                    Message:"ログインに失敗しました。"
                })
                return
            }

            const SelectTokenSQL =
                "select user_token from token where user_id = (" +
                "select user_id from user where mail_address = ? and password = ? and is_deleted = 0 limit 1" +
                ") and is_deleted = 0"

            const [SelectTokenResult,] = await connection.query(SelectTokenSQL,[MailAddress,HashPassword])

            const Token = SelectTokenResult[0].user_token

            res.json({
                ServerError:false,
                ClientError:false,
                Token:Token
            })

        }catch (e) {

        }finally {
            await connection.end()
        }
    })


// メールアドレス重複チェック
router.get("/checkMailAddress", async (req, res) => {
    const {MailAddress} = req.query
    const CheckMailAddressResult = await isOverlappingMailAddress(MailAddress)
    if (CheckMailAddressResult.error) {
        res.json({
            ServerError: true,
            ClientError: false,
            Message: "サーバーエラー"
        })
        return
    }
    if (CheckMailAddressResult.overlapping) {
        res.json({
            ServerError: false,
            ClientError: true,
            Message: "このメールアドレスは既に登録済みです。"
        })
        return
    }
    res.json({
        ServerError: false,
        ClientError: false
    })
})

//アカウント名重複チェック
router.get("/checkAccountName", async (req, res) => {
    const {AccountName} = req.query
    const CheckAccountNameResult = await isOverlappingAccountName(AccountName)
    if (CheckAccountNameResult.error) {
        res.json({
            ServerError: true,
            ClientError: false,
            Message: "サーバーエラー"
        })
        return
    }
    if (CheckAccountNameResult.overlapping) {
        res.json({
            ServerError: false,
            ClientError: true,
            Message: "このアカウント名は既に登録済みです。"
        })
        return
    }
    res.json({
        ServerError: false,
        ClientError: false
    })
})

module.exports = router