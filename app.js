const express = require("express")
const app = express()


const cors = require("cors")

const fileUpload = require("express-fileupload")



app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true,
    optionsSuccessStatus: 200
}))

// ファイルアップロードの設定
app.use(fileUpload())

app.use(express.json());
app.use(express.urlencoded({extended: true, limit: "50mb"}));

app.use(express.static("files"))





app.listen(3000)