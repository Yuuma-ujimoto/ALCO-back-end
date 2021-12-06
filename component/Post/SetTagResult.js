module.exports = function (TagDataArray) {
    try {
        let TagResult = {}
        let PostId
        let TagName
        for (let TagData of TagDataArray) {
            PostId = TagData.PostId
            TagName = TagData.TagName
            if (!TagResult[PostId]) {
                TagResult[PostId] = [TagName]
            } else {
                TagResult[PostId].push(TagName)
            }
        }
        console.log(TagResult)
        return {
            ClientError: false,
            ServerError: false,
            TagResult:TagResult
        }
    } catch (e) {
        console.log(e)
        return {
            ServerError: true,
            ClientError: false,

        }
    }
}