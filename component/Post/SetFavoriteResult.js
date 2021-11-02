module.exports = (FavoriteResult)=>{
    try {
        let ReturnFavoriteResult = {}
        for (let Favorite of FavoriteResult) {
            if (Favorite.hasOwnProperty("PostId")) {
                ReturnFavoriteResult[Favorite.PostId] = Favorite.FavCount
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