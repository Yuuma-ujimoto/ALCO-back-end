module.exports = function (ReplyResult) {
    try {

        let ReturnReplyResult = {}
        let ResultPushObject
        for (let LoopObject of ReplyResult) {
            ResultPushObject = {}
            if (!ReturnReplyResult[LoopObject.PostId]) {
                ReturnReplyResult[LoopObject.PostId] = []
            }
            ResultPushObject["PostReplyText"] = LoopObject.PostReplyText
            ResultPushObject["AccountName"] = LoopObject.AccountName
            ResultPushObject["DisplayName"] = LoopObject.DisplayName
            ReturnReplyResult[LoopObject.PostId].push(ResultPushObject)
        }

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