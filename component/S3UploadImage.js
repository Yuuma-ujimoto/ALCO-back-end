const path = require("path")

module.exports = async (ImageData) => {


    try {

        console.log(ImageData)
        // imageのファイル名をsplitした値　拡張子を出す際に変数化しとくと楽なので作成
        const SplitImageData = ImageData.name.split(".")

        // pythonで-1をindexに指定するだけで最後尾の値取れる機能がjsにも欲しい
        const ImageExtension = SplitImageData[SplitImageData.length - 1]

        // md5でHash化された値がデフォルトで取得できるのでこれをそのままファイル名として使う
        const ImageFileName = ImageData.md5

        // ファイルパス
        const ImageFilePath = `${ImageFileName}.${ImageExtension}`
        const ImageFileAbsolutePath = path.join("./files/", ImageFilePath)
        await ImageData.mv(ImageFileAbsolutePath)
        return {
            ServerError: false,
            ClientError:false,
            // MEMO:ImageFileAbsolutePathをImageFilePathの混同後からみた時に混乱しない？
            ImageFilePath: ImageFileAbsolutePath
        }
    } catch (e) {
        console.log(e)
        return {
            ClientError:false,
            ServerError: true,
            Message:"サーバーエラー"
        }
    }
}
