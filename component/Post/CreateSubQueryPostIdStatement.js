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

        let SubQueryPostIdStatement = "("
        //先頭判定＆Resultが存在してるかを判定
        let firstFlag = true
        for (let Result of SelectPostResult) {
            //  三項演算子で書いた方が短くなりそうだけどこっちの方が後から見た時に
            //　わかりやすそう
            if (firstFlag) {
                SubQueryPostIdStatement += Result.post_id
                firstFlag = false
            } else {
                SubQueryPostIdStatement += ("," + Result.post_id)
            }
        }
        SubQueryPostIdStatement += ")"

        if (firstFlag) {
            return {
                ServerError: false,
                ClientError: true,
                Result: "投稿が存在しません。"
            }
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
