/*
:MEMO:
     これを（post_id以外のプロパティもある）
     [
         {post_id: 7、〜〜〜},
         {post_id: 8,〜〜〜}
     ]
     こうしたい
     "(7,8)"
*/

module.exports = function (SelectPostResult) {
    try {
        console.log(SelectPostResult)
        let SubQueryPostIdStatement = []
        for (let Result of SelectPostResult) {
            SubQueryPostIdStatement.push(Result.PostId)
        }
        return {
            ServerError: false,
            ClientError: false,
            SubQueryPostIdStatement: SubQueryPostIdStatement
        }
    } catch (e) {
        console.log(e)
        return {
            ServerError: true,
            ClientError: false,
            Message: "サーバーエラー"
        }
    }

}
