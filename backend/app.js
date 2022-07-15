var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var slugify = require('slugify')
var cors = require('cors')


var fs = require('fs');
var path = require('path');
require('dotenv/config');


mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true }, err => {
        console.log('connected')
    });

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

var multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});



const whitelist = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
]

var imgModel = require('./models/model');

app.get('/', (req, res) => {
    imgModel.find({}, (err, items) => {

        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            //res.render('imagesPage', { items: items });
            res.send({ items: items }) ;
        }
    });
});

const upload = multer({
    storage: multer.diskStorage({
        destination: path.join('/home/patricia/Schreibtisch/trondates/frontend/public/uploads'),
        filename: (req, file, cb) => {
            const name = slugify(file.originalname, { lower: true })
            cb(null, `${new Date().getTime()}-${name}`)
        },
    }),
    fileFilter: (req, file, cb) => {
        if (!whitelist.includes(file.mimetype)) {
            return cb(new Error('file is not allowed'))
        }

        cb(null, true)
    }
})

//Upload single from multer puts the under "img" in frontend
//uploaded image into the uploads folder
app.post('/', upload.single('img'), async (req, res, next) => {
    /*const meta = await FileType.fromFile(req.file.path)

    if (!whitelist.includes(meta.mime)) {
      return next(new Error('file is not allowed'))
    }*/
    //

    var model = { userconnected: req.body.userconnected, imageName: req.file.filename }
    console.log(model)
    imgModel.create(model, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            item.save();
            res.redirect('http://localhost:3000');
        }
    });

});

var port = process.env.PORT || '8080'
app.listen(port, err => {
    if (err)
        throw err
    console.log('Server listening on port', port)
})