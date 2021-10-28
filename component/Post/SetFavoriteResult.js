module.exports = (FavoriteResult)=>{
    let ReturnFavoriteResult = {}
    for (let Favorite of FavoriteResult){
        if (Favorite.hasOwnProperty("post_id")) {
            ReturnFavoriteResult[Favorite.post_id] = Favorite.count
        }
    }
    return ReturnFavoriteResult
}