const fs = require('fs')
const path = require('path')
const slugify = require('slugify')
const mammoth = require('mammoth')
const { Document, Packer, Paragraph, TextRun } = require('docx')
const docModel = require('../models/docModel')
const cloudinary = require('../config/cloudinary')

const fileName = (file) => {
    if (file) {
        return slugify(file, { lower: true })
    }
}

const uploader = async (path) => await cloudinary.uploads(path, 'Docs')


//allowed mimetypes for documents
const allowed = ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

const uploadDoc = async (req, res) => {
    let file, filePath, uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            status: 'fail',
            error: 'No files were uploaded.'
        });
    }
    else if (!allowed.includes(req.files.doc.mimetype)) {
        return res.status(400).json({
            status: 'fail',
            error: 'only word documents (.doc, .docx) is allowed'
        })
    }
    else {

        try {
            const filename = fileName(req.files.doc.name)
            // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
            file = req.files.doc;
            filePath = 'uploads/' + new Date().getTime() + "-" + filename;
            uploadPath = path.join(__dirname, "../" + filePath)
            console.log(uploadPath)

            // Use the mv() method to place the file somewhere on your server
            file.mv(uploadPath, function (err) {
                if (err)
                    return res.status(500).json({
                        status: 'fail',
                        error: err
                    });

                uploader(filePath).then(newPath => {

                    docModel.create({
                        name: newPath.url,
                        user: req.user.id
                    }).then(result => {
                        console.log(result)
                        res.status(201).json(
                            {
                                status: 'success',
                                message: 'upload successful',
                                data: result.name
                            }
                        );

                    }).catch(err => {
                        console.log(err)
                        fs.unlinkSync(filePath)
                        res.status(500).json({
                            error: 'Something went wrong'
                        })
                    }).catch(err => {
                        console.log(err)

                        res.status(500).json({
                            status: 'fail',
                            error: 'Something went wrong'
                        })
                    })

                })

            });

        } catch (error) {
            console.log(error)
            res.status(500).json({
                status: 'fail',
                error: 'Something went wrong'
            })
        }

    }

}

// const uploadDoc = async (req, res) => {

//     let file, filePath, uploadPath;

//     if (!req.files || Object.keys(req.files).length === 0) {
//         return res.status(400).send('No files were uploaded.');
//     }
//     else if (!allowed.includes(req.files.doc.mimetype)) {
//         return res.status(400).json({
//             status: 'fail',
//             error: 'only word documents (.doc, .docx) is allowed'
//         })
//     }
//     else {

//         // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
//         file = req.files.doc;
//         const filename = fileName(req.files.doc.name)
//         filePath = 'uploads/' + Date.now() + "-" + filename;
//         uploadPath = path.join(__dirname, "../" + filePath)
//         console.log(uploadPath)

//         // Use the mv() method to place the file somewhere on your server
//         file.mv(uploadPath, function (err) {
//             if (err)
//                 return res.status(500).json({
//                     status: 'fail',
//                     error: err
//                 }
//                 );

//             docModel.create({
//                 name: filePath,
//                 user: req.user.id
//             }).then(result => {
//                 console.log(result)
//                 res.status(201).json(
//                     {
//                         status: 'success',
//                         data: 'File uploaded!'
//                     }
//                 );

//             }).catch(err => {
//                 console.log(err)
//                 fs.unlink(uploadPath)
//                 res.status(500).json({
//                     error: 'Something went wrong'
//                 })
//             })

//         });
//     }
// }

const downloadDoc = async (req, res) => {
    const { docId } = req.params
    try {
        let doc = await docModel.findOne({ id: docId, user: req.user.id })
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
        let doc = await docModel.findOne({ id: docId, user: req.user.id })
        if (doc) {
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

    if (name && document) {

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
            uploader(docName).then(newPath => {
                fs.unlinkSync(docName)

                docModel.create({
                    name: newPath.url,
                    user: req.user.id
                }).then(result => {
                    console.log(result)
                    res.status(201).json(
                        {
                            status: 'success',
                            message: 'upload successful',
                            data: result.name
                        }
                    );

                }).catch(err => {
                    console.log(err)
                    fs.unlinkSync(filePath)
                    res.status(500).json({
                        error: 'Something went wrong'
                    })
                })
            }).catch(err => {
                console.log(err)

                res.status(500).json({
                    status: 'fail',
                    error: 'Something went wrong'
                })
            })

        });

    }
    else {
        res.status(400).json({
            status: 'fail',
            error: 'provide name'
        })
    }

}

const readDoc = async (req, res) => {
    const { docId } = req.params
    try {
        let doc = await docModel.findOne({ id: docId, user: req.user.id })
        if (doc) {
            mammoth.convertToHtml({ path: `${doc.name}` })
                .then(function (result) {
                    const html = result.value; // The generated HTML
                    const messages = result.messages; // Any messages, such as warnings during conversion
                    console.log(messages)
                    res.status(200).json({
                        status: 'success',
                        data: html
                    })
                })
                .done();
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
        let docs = await docModel.find().where({ user: req.user.id })
        console.log(docs)
        if (docs.length > 0) {
           
            res.status(200).json({
                status: 'success',
                data: docs                   
            })
        }
        else {
            res.status(200).json({
                status: 'success',
                data: 'no docs'
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


const getDoc = async (req, res) => {
    const { id } = req.user
    const { docId } = req.params
    try {
        let doc = await docModel.findOne({ id: docId, user: id })
        if (doc) {
            let data = {
                id: doc._id,
                name: doc.name
            }
            res.status(200).json({
                status: 'success',
                data
            })
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

module.exports = {
    createDoc, uploadDoc,
    deleteDoc, downloadDoc,
    readDoc, getDocs,
    getDoc
}


/* 

cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });





*/