const express = require('express')
require('dotenv').config()
const docRoutes = require('./routes/docRoute')


const app = express()
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/doc/", docRoutes)

const PORT = process.env.PORT || 5000;
const dbInit = async () => {
    try {
        //connect to mongodb here
        console.log('Connected successfully to database')

    } catch (error) {
        console.log('Failed to connect to database', error)
    }
}
//connect to Database
dbInit()

app.listen(5000, () => { console.info('Server started running on port ' + PORT) })