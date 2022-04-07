const { Schema, model } = require('mongoose')
const bcyrpt = require('bcryptjs')

const schema = Schema({
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
})

schema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    //Hash password with a cost of 12
    this.password = await bcyrpt.hash(this.password, 12)

    next();

})
schema.methods.comparePassword = async function (candidatePassword, usesrPassword) {
    return await bcyrpt.compare(candidatePassword, usesrPassword)
}
const userModel = model('user', schema)
module.exports = userModel

