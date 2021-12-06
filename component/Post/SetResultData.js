
module.exports =  class SetResultData {
    constructor(PostData, PostImageData, TagData, ReplyData, FavData,MyFavoriteData) {

        this.IndexArray = []
        this.Index = null
        this.ResultArray = []

        this.PostData = PostData
        this.PostImageData = PostImageData
        this.TagData = TagData
        this.ReplyData = ReplyData
        this.FavData = FavData
        this.MyFavoite = MyFavoriteData

        let loopCount = 0
        for (let Post of this.PostData) {
            this.ResultArray.push(Post)
            this.IndexArray.push(Post.PostId)
            // 自分がいいねしたかどうかの判定
            this.ResultArray[loopCount].isMyFavorite = this.MyFavoite.indexOf(Post.PostId) !== -1
            loopCount++
        }
        for (let PostImage of this.PostImageData) {
            this.Index = this.IndexArray.indexOf(PostImage.PostId)

            this.PushData(PostImage.ImageUrl, "PostImageResult")
        }
        for (let Reply of this.ReplyData) {
            this.Index = this.IndexArray.indexOf(Reply.PostId)
            delete Reply.PostId
            this.PushData(Reply, "ReplyResult")
        }
        for (let Tag of this.TagData) {
            this.Index = this.IndexArray.indexOf(Tag.PostId)
            this.PushData(Tag.TagName, "Tag")
        }
        for (let Fav of this.FavData) {
            this.ResultArray[this.IndexArray.indexOf(Fav.PostId)].FavCount = Fav.FavCount
        }
        return {
            ServerError: false,
            ClientError: false,
            ResultArray: this.ResultArray
        }
    }

    PushData(Data, Type) {
        if (!this.ResultArray[this.Index][Type]) {
            this.ResultArray[this.Index][Type] = [Data]
        } else {
            this.ResultArray[this.Index][Type].push(Data)
        }
    }
}

