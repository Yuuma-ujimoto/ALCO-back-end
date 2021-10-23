const mysql = require("mysql2/promise")
const mysql_config = require("../config/mysql")

// overlapping　trueで重複
// error trueでエラー

module.exports = async (MailAddress)=>{
    const connection = await mysql.createConnection(mysql_config)

    try {
        let overlapping = false

        const CheckMailAddressSQL = "select count(*) as count from user where mail_address = ? and is_deleted = 0"
        const [CheckMailAddressResult,] = await connection.query(CheckMailAddressSQL,[MailAddress])

        if (CheckMailAddressResult[0].count){
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