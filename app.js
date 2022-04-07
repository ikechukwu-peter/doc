const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const passport = require('passport')
const fileUpload = require('express-fileupload')
const multer = require('multer')
const slugify = require('slugify')
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

app.use(fileUpload())

const allowed = ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

const checkMimeType = (req, res, next) => {
    if (allowed.includes(req.files.doc.mimetype)) {
        next()
    }
    else {
        res.status(400).json({
            status: 'fail',
            error: 'only word document (.doc and .docx) is allowed'
        })
    }
}


const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/uploads/');
    },
    filename: (req, file, cb) => {
        const name = slugify(file.originalname, { lower: true })
        cb(null, `${new Date().getTime()}-${name}`)
    }
});

const multerFilter = (req, file, cb) => {
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only word doc or docx allowed!'), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});


var uploads = multer({ dest: './uploads/' });

app.post('/single', uploads.single('doc'), (req, res) => {
    try {
        res.send(req.file);
    } catch (err) {
        res.send(400);
    }
});

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