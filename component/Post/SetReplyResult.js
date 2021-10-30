module.exports = function (ReplyResult) {
    try {

        let ReturnReplyResult = {}
        let ResultPushObject
        for (let LoopObject of ReplyResult) {
            ResultPushObject = {}
            console.log(LoopObject)
            if (!ReturnReplyResult[LoopObject.post_id]) {
                ReturnReplyResult[LoopObject.post_id] = []
            }
            ResultPushObject["reply_content"] = LoopObject.reply_content
            ResultPushObject["account_name"] = LoopObject.account_name
            ResultPushObject["display_name"] = LoopObject.display_name
            ReturnReplyResult[LoopObject.post_id].push(ResultPushObject)
        }

        console.log(ReturnReplyResult)

        return {
            ServerError: false,
            ClientError: false,
            Result:ReturnReplyResult
        }
    }
    catch (e){
        return {
            ServerError:true,
            ClientError:false,
            Message:"サーバーエラー"
        }
    }
}