const fs = require('fs')
const multer = require('multer')
const slugify = require('slugify')
const { Document, Packer, Paragraph, TextRun } = require('docx')
const docModel = require('../models/docModel')

const fileName = (file) => {
    if (file) {
        return slugify(file, { lower: true })
    }
}

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


const uploadDoc = async (req, res) => {
    if (req.files) {
        const name = fileName(req.files.doc.name)
        console.log(name)
        res.status(201).json({
            status: 'success',
            data: 'Uploaded successfully'
        })
    }
    else {
        res.status(400).json({
            status: 'fail',
            error: 'Add a document'
        })
    }
}




// const uploadDoc = async (req, res) => {
//    return upload(req, res, (err) => {
//         if (err instanceof multer.MulterError) {
//             console.log("IA MA FROM INSTANCE", err)
//             res.status(400).json({
//                 status: 'fail',
//                 error: err
//             })
//         }
//         else if (err) {

//             res.status(400).json({
//                 status: 'fail',
//                 error: 'only word document allowed (.doc or .docx)'
//             })
//         }
//         else {
//             if (req.files) {
//                 const name = fileName(req.files.doc.name)
//                 console.log(name)
//                 res.status(201).json({
//                     status: 'success',
//                     data: 'Uploaded successfully'
//                 })
//             }
//             else {
//                 res.status(400).json({
//                     status: 'fail',
//                     error: 'Add a document'
//                 })
//             }

//         }
//     })

// }

const downloadDoc = async (req, res) => {
    const { docId } = req.params
    try {
        let doc = await docModel.findById(docId)
        if (doc) {
            let filename = doc.name
            res.download(filename)
        }
        else {
            res.status(400).json({
                status: 'fail',
                error: 'Error processing your request'
            })
        }


    } catch (error) {
        console.log(error)
        if (error.name === 'CastError') {
            res.status(500).json({
                status: 'fail',
                error: 'Invalid document Id'
            })
        }
        else {
            res.status(500).json({
                status: 'fail',
                error: 'Something went wrong, please try again'
            })
        }

    }

}


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
        if (error.name === 'CastError') {
            res.status(500).json({
                status: 'fail',
                error: 'Invalid document Id'
            })
        }
        else {
            res.status(500).json({
                status: 'fail',
                error: 'Something went wrong, please try again'
            })
        }

    }

}


const getDocs = async (req, res) => {
    try {
        let doc = await docModel.find()
        if (doc.length > 0) {
            let data = {
                id: doc._id,
                name: doc.name
            }
            // let data = fs.readFileSync(doc.name)
            res.send(doc)
        }
        else {
            res.status(200).json({
                status: 'success',
                data: 'no docs'
            })
        }

    } catch (error) {
        console.log(error)
        if (error.name === 'CastError') {
            res.status(500).json({
                status: 'fail',
                error: 'Invalid document Id'
            })
        }
        else {
            res.status(500).json({
                status: 'fail',
                error: 'Something went wrong, please try again'
            })
        }

    }

}

module.exports = { createDoc, uploadDoc, deleteDoc, downloadDoc, readDoc, upload, checkMimeType, getDocs }


/* 

cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });





*/