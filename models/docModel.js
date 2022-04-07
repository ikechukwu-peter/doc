const { Schema, model, SchemaTypes } = require('mongoose')

const schema = Schema({
    name: String,
    user: {
        type: SchemaTypes.ObjectId,
        ref: 'user',
        required: true
    }
})

const docModel = model('doc', schema)
module.exports = docModel

