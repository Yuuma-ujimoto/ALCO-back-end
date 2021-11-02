

module.exports = function (PostImageResult) {
    try {


        const ReturnImageResult = {}

        for (let PostImage of PostImageResult) {
            console.log(PostImage)
            if (!ReturnImageResult[PostImage.PostId]) {
                ReturnImageResult[PostImage.PostId] = [PostImage.ImageUrl]
            } else {
                ReturnImageResult[PostImage.PostId].push(PostImage.ImageUrl)
            }
        }
        console.log(ReturnImageResult)
        return {
            ServerError: false,
            ClientError: false,
            Result:ReturnImageResult
        }
    }
    catch (e){
        console.log(e)
        return{
            ServerError:true,
            ClientError:false,
            Message:"サーバーエラー"
        }
    }
}
