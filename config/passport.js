const { Strategy, ExtractJwt } = require('passport-jwt')

let options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

module.exports = (passport) => {
    passport.use(
        new Strategy(options, async (jwt_payload, done) => {
            try {
                if (jwt_payload.id && jwt_payload.username) {
                    let user = {
                        id: jwt_payload.id,
                        username: jwt_payload.username
                    }
                    return done(null, user)
                }
                return done(null, false)
            } catch (error) {
                console.log(error)
            }
        })
    )
}