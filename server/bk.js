const express = require('express')
const bodyParser = require('body-parser')
const Jimp = require('jimp')

const app = express()

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.json())

port = 4000

app.post('/', (req, res) => {
    Jimp.read(Buffer.from(req.body.base64, 'base64'))
        .then(image => {
            image.greyscale()

            image.getBase64(Jimp.MIME_PNG, (err, result) => {
                res.writeHead(200, { 'Content-Type': 'text/plain' })
                res.write(result)
                res.end()
            })
        })
        .catch(err => {
            console.log(err)
        })
})

app.listen(port, () => console.log(`listening on port ${port}`))
