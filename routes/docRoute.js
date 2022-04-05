
const express = require('express')
const { createDoc, uploadDoc, deleteDoc, downloadDoc, readDoc } = require('../controllers/docController')
const router = express.Router()



router.post('/create/doc', createDoc)
router.post('/upload/doc', uploadDoc)
router.post('/download/:docId', downloadDoc)
router.delete('/delete/:docId', deleteDoc)
router.delete('/read/:docId', readDoc)


module.exports = router;