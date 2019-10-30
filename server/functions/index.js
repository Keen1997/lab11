const functions = require('firebase-functions')

const admin = require('firebase-admin')
admin.initializeApp()

const express = require('express')
const bodyParser = require('body-parser')
const Jimp = require('jimp')

const app = express()

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.json())

app.post('/', (req, res) => {
    Jimp.read(Buffer.from(req.body.base64, 'base64'))
        .then(image => {
            image.greyscale()

            image.getBase64(Jimp.MIME_PNG, (err, result) => {
                admin.database().ref('/base64/'+Date.now()).set(result);

                res.writeHead(200, { 'Content-Type': 'text/plain' })
                res.write(result)
                res.end()
            })
        })
        .catch(err => {
            console.log(err)
        })
})

exports.uploadImage = functions.https.onRequest(app)