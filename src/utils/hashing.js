const argon2 = require('argon2')
const { passSalt } = require('./constants')

exports.createPasswordHash = (password) => {
    try {
        return argon2.hash(password, {
            salt: Buffer.from(passSalt),
        })
    } catch (err) {
        console.error(err)
        throw err
    }
}
