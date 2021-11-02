const mysql = require("mysql2/promise")
const mysql_config = require("../../config/mysql")
module.exports = async (UserId)=>{
    const connection = await mysql.createConnection(mysql_config)
    try {


        const SelectMyFavoriteSQL =
            "select post_id from post_favorite where user_id = ? and is_deleted = 0"
        const [SelectMyFavoriteResult,] = await connection.query(SelectMyFavoriteSQL,[UserId])

        let EditMyFavoriteResult = []

        for (let Favorite of Object.keys(SelectMyFavoriteResult)){
            EditMyFavoriteResult.push(SelectMyFavoriteResult[Favorite].post_id)
        }


        return {
            ServerError:false,
            ClientError:false,
            FavoriteResult:EditMyFavoriteResult
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

    }
}