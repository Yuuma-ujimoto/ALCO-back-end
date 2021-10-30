const mysql = require("mysql2/promise")
const mysql_config = require("../config/mysql")

module.exports = async (req) => {
    const connection = await mysql.createConnection(mysql_config)
    try {
        if (!req.header("token")){
            return {
                ServerError: false,
                ClientError: true,
                Message:"トークンが存在しません。"
            }
        }
        const AuthTokenSQL = "select user_id from user_token where user_token = ?"
        const [AuthTokenResult,] = await connection.query(AuthTokenSQL, [req.header("token")])

        if (!AuthTokenResult[0].user_id) {
            return {
                ServerError: false,
                ClientError: true,
                Message:"認証失敗"
            }
        }
        return {
            ServerError:false,
            ClientError:false,
            UserId:AuthTokenResult[0].user_id
        }
    }
    catch (e) {
        console.log(e)
        return {
            ServerError:true,
            ClientError:false,
            Message:"サーバーエラー"
        }
    }
    finally {
        await connection.end()
    }
}