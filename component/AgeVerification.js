module.exports = (BirthdateYear, BirthdateMonth, BirthdateDate) => {
    try {

        const now_time = new Date()

        const StringBirthDayMonth = BirthdateMonth < 10 ? "0" + BirthdateMonth.toString() : BirthdateMonth.toString()
        const StringBirthDayDate = BirthdateDate < 10 ? "0" + BirthdateDate.toString() : BirthdateDate.toString()
        const FormatBirthDay = BirthdateYear.toString() + "-" + StringBirthDayMonth + "-" + StringBirthDayDate
        const target_time = new Date(FormatBirthDay)

        if (20 < (now_time - target_time) / (1000 * 60 * 60 * 24 * 365)) {
            return {
                ServerError: false,
                ClientError: false,
                BirthDay: FormatBirthDay
            }
        }
        return {
            ServerError: false,
            ClientError: true,
            Message: "未成年は登録できません。"
        }
    }catch (e) {
        console.log(e)
        return {
            ServerError: true,
            ClientError: false,
            Message: "サーバーエラー"
        }
    }
}

