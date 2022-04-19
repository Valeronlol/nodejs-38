const { HttpError } = require('../utils/curstom-errors')
const jwt = require('../service/jwt')

// const invalidTokens = [];

exports.checkAuth = (req) => {
    const { authorization } = req.headers
    if (!authorization) {
        throw new HttpError('Unathorized.', 401)
    }
    try {
        const [_, token] = authorization.split(' ')
        // if (invalidTokens.includes(token)) {
        //   throw new HttpError('Unathorized.', 401)
        // }
        req.user = jwt.verify(token)
    } catch (err) {
        console.error(err)
        throw new HttpError('Unathorized.', 401)
    }
}

exports.checkRole = (...requiredRoles) => (req) => {
    const currentUserRoles = req.user.roles || []
    if (!currentUserRoles.some((role) => requiredRoles.includes(role))) {
        throw new HttpError(`Forbidden. Some of ${requiredRoles.join(',')} is required.`, 403)
    }
}
