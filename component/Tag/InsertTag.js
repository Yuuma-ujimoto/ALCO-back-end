const mysql = require("mysql2/promise")
const mysql_config = require("../../config/mysql")
module.exports = async (Tag,PostId)=>{
    if (!Tag){
        return{
            ClientError:false,
            ServerError:false
        }
    }
    if (!PostId){
        return {
            ClientError: false,
            ServerError: true,
            Message:"処理エラー"
        }
    }

    const TagArray = Array.isArray(Tag) ? Tag : [Tag]
    const connection = await mysql.createConnection(mysql_config)
    try {
        const InsertPostTagSQL = "insert into tag_to_post(post_id,alco_tag_id) values(?,?)"
        const SelectTagIdSQL = "select alco_tag_id from alco_tag where tag_name = ?"
        const InsertTagSQL = "insert into alco_tag(tag_name) value(?)"

        let TagId = null
        for (let TagData of TagArray) {
            const SelectTagIdResult = await connection.query(SelectTagIdSQL,[TagData])
            // Tagが既に登録済みならTagのIDを取得
            // 未登録の場合登録してIDを書き出し
            if (!SelectTagIdResult.alco_tag_id){
                const [InsertTagResult,] = await connection.query(InsertTagSQL,[TagData])
                TagId = InsertTagResult.insertId
            }
            else{
                TagId = SelectTagIdResult.alco_tag_id
            }
            await connection.query(InsertPostTagSQL,[PostId,TagId])
        }
        return {
            ServerError:false,
            ClientError:false
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