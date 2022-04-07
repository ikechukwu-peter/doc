
const express = require('express')
const passport = require('passport')
const { createDoc, uploadDoc, deleteDoc, downloadDoc, readDoc,
    checkMimeType, getDocs, getDoc
} = require('../controllers/docController')
const router = express.Router()

router.post('/create', passport.authenticate('jwt', { session: false }), createDoc)
// router.post('/upload', passport.authenticate('jwt', { session: false }), checkMimeType, upload.single('doc'), uploadDoc)
router.get('/download/:docId', passport.authenticate('jwt', { session: false }), downloadDoc)
router.delete('/delete/:docId', passport.authenticate('jwt', { session: false }), deleteDoc)
router.get('/read/:docId', passport.authenticate('jwt', { session: false }), readDoc)
router.post('/docs', passport.authenticate('jwt', { session: false }), getDocs)
router.post('/doc/:docId', passport.authenticate('jwt', { session: false }), getDoc)



module.exports = router;