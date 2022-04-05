const { Schema, model } = require('mongoose')

const schema = Schema({
    name: String,
})

const docModel = model('doc', schema)
module.exports = docModel

