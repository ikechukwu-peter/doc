
const fs = require('fs')
const multer = require('multer')
const slugify = require('slugify')
const { Document, Packer, Paragraph, TextRun } = require('docx')
const docModel = require('../models/docModel')


const allowed = ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
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

const downloadDoc = async (req, res) => {
    const { docId } = req.params
    try {
        let doc = await docModel.findById(docId)
        if (doc) {
            let data = fs.readFileSync(doc.name)
            res.download(data)
        }
        else {
            res.status(400).json({
                status: 'fail',
                error: 'Error processing your request'
            })
        }


    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'fail',
            error: 'Something went wrong, please try again'
        })
    }

}

const uploadDoc = upload.single('doc')

const deleteDoc = async (req, res) => {
    const { docId } = req.params
    try {
        let doc = await docModel.findById(docId)
        if (doc) {
            fs.unlinkSync(doc.name)
            await doc.remove()
            res.status(204).send()
        }
        else {
            res.status(400).json({
                status: 'fail',
                error: 'Error processing your request'
            })
        }


    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'fail',
            error: 'Something went wrong, please try again'
        })
    }
}

const createDoc = async (req, res) => {
    const { name, document } = req.body;
    if (name) {

        const docName = `uploads/${new Date().getTime()}-${name}.doc`

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun(document),
                        ],
                    }),
                ],
            }],
        });
        // Used to export the file into a .docx file
        Packer.toBuffer(doc).then((buffer) => {
            fs.writeFileSync(docName, buffer);
        });

        try {
            let newDoc = await docModel.create({ name: docName })
            if (newDoc) {
                res.status(201).json({
                    status: 'success',
                    data: newDoc.name
                })
            }
            else {
                res.status(500).json({
                    status: 'fail',
                    error: 'Error while creating a new doc'
                })
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({
                status: 'fail',
                error: 'Something went wrong, please try again'
            })
        }

        res.status(200).json({
            status: 200,
            message: 'Welcome to DOC'
        })
    }
    else {
        res.status(400).json({
            status: 400,
            error: 'provide name'
        })
    }

}

const readDoc = async (req, res) => {
    const { docId } = req.params
    try {
        let doc = await docModel.findById(docId)
        if (doc) {
            let data = fs.readFileSync(doc.name)
            res.send(data)
        }
        else {
            res.status(400).json({
                status: 'fail',
                error: 'Error processing your request'
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'fail',
            error: 'Something went wrong, please try again'
        })
    }

}


module.exports = { createDoc, uploadDoc, deleteDoc, downloadDoc, readDoc}


/* 

cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });





*/