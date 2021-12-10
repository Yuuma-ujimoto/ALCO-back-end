const express = require("express")
const app = express()
const path = require("path")

const cors = require("cors")

const fileUpload = require("express-fileupload")



app.use(cors())

// ファイルアップロードの設定
app.use(fileUpload())

app.use(express.json());
app.use(express.urlencoded({extended: true, limit: "50mb"}));

// app.use(express.static(path.join(__dirname+"/files")))
app.use("/files",express.static(path.join(__dirname,"/files")))

const UserRouter = require("./API/User")
const PostRouter = require("./API/Post")
const TimelineRouter = require("./API/TimeLine")
const NoticeRouter = require("./API/Notice")

app.use("/user",UserRouter)
app.use("/post",PostRouter)
app.use("/timeline",TimelineRouter)
app.use("/notice",NoticeRouter)

app.listen(3000)