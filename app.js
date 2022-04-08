const express = require('express')
const mongoose = require('mongoose')
const cluster = require('cluster')
const cpus = require('os').cpus;
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

//Handle all undefined route hit by the client
app.all("*", (req, res, next) => {
    res.status(404).json({
        status: 'fail',
        error: `Can't find ${req.originalUrl} on this server!`,
    });
});


const numWorkers = cpus().length;

if (cluster.isPrimary) {

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {

    //Handle uncaughtExceptions
    process.on("uncaughtException", (err) => {
        console.log("UNCAUGHT EXCEPTION! Server shutting down...");
        console.log(err.name, err.message, err.stack);
        process.exit(1);
    });



    const port = process.env.PORT || 5000;
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

    app.listen(5000, () => { console.info('Server started running on port ' + port) })


    process.on('unhandledRejection', err => {
        console.log('UNHANDLED REJECTION! 💥 Shutting down...');
        console.log(err.name, err.message, err.stack);
        server.close(() => {
            process.exit(1);
        });
    });

    //For heroku
    process.on('SIGTERM', () => {
        console.log('SIGTERM RECEIVED. Shuttig down gracefully!!');

        server.close(() => {
            console.log('Process terminated!');
        })

    })

}