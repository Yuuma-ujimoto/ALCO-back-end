const mysql = require("mysql2/promise")
const mysql_config = require("../config/mysql")


module.exports = async (AccountName)=>{
    const connection = await mysql.createConnection(mysql_config)

    try {
        let overlapping = false

        const CheckAccountNameSQL = "select count(*) as count from user where account_name = ? and is_deleted = 0"
        const [CheckAccountNameResult,] = await connection.query(CheckAccountNameSQL,[AccountName])

        if (CheckAccountNameResult[0].count){
            overlapping = true
        }

        return {
            error:false,
            overlapping:overlapping
        }

    }
    catch (e) {
        console.log(e)
        return {
            error:true,
            overlapping:true
        }
    }
    finally {
        await connection.end()
    }
}