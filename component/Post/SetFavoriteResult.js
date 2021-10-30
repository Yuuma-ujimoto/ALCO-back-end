module.exports = (FavoriteResult)=>{
    try {


        let ReturnFavoriteResult = {}
        for (let Favorite of FavoriteResult) {
            if (Favorite.hasOwnProperty("post_id")) {
                ReturnFavoriteResult[Favorite.post_id] = Favorite.count
            }
        }
        return {
            ServerError: false,
            ClientError: false,
            Result:ReturnFavoriteResult
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
}