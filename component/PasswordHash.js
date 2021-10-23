const hash_config = require("../config/hash")
const crypto = require("crypto")

//PasswordをHash化する関数
module.exports = (Password)=>{
    const sha512 = crypto.createHash(hash_config.crypto)
    sha512.update(Password+hash_config.salt)
    return sha512.digest("hex")
}
