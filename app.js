const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const passport = require('passport')
const fileUpload = require('express-fileupload')
const authenticate = require('./config/passport')
const userRoutes = require('./routes/userRoute')
const docRoutes = require('./routes/docRoute')


const app = express()
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

//initialize passport
app.use(passport.initialize())

//passport config
authenticate(passport)

app.use(fileUpload({
    limits: {
        fileSize: 50 * 1024 * 1024
    }
}))

app.use("/user/", userRoutes)
app.use("/doc/", docRoutes)

const PORT = process.env.PORT || 5000;
const dbInit = async () => {
    try {
        //connect to mongodb here
        mongoose.connect(process.env.DATABASE, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Connected successfully to database')

    } catch (error) {
        console.log('Failed to connect to database', error)
    }
}
//connect to Database
dbInit()

app.listen(5000, () => { console.info('Server started running on port ' + PORT) })