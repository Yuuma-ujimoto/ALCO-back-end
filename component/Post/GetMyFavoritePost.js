const mysql = require("mysql2/promise")
const mysql_config = require("../../config/mysql")
module.exports = async (UserId,Query)=>{
    const connection = await mysql.createConnection(mysql_config)
    try {
        let EditMyFavoriteResult = []

        if (!!Query){
            const SelectMyFavoriteSQL =
                "select post_id from post_favorite where user_id = ? and is_deleted = 0 and post_id in (?)"
            const [SelectMyFavoriteResult,] = await connection.query(SelectMyFavoriteSQL,[UserId,Query])

            for (let Favorite of Object.keys(SelectMyFavoriteResult)){
                EditMyFavoriteResult.push(SelectMyFavoriteResult[Favorite].post_id)
            }
        }
        else {
            const SelectMyFavoriteSQL =
                "select post_id from post_favorite where user_id = ? and is_deleted = 0"
            const [SelectMyFavoriteResult,] = await connection.query(SelectMyFavoriteSQL,[UserId])

            for (let Favorite of Object.keys(SelectMyFavoriteResult)){
                EditMyFavoriteResult.push(SelectMyFavoriteResult[Favorite].post_id)
            }
        }


        console.log(EditMyFavoriteResult)


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