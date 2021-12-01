const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');
const port = process.env.PORT || 4000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

console.log('testing heroku updated server version')

// Mongoose client connection
mongoose.connect(process.env.MONGO_CON_STRING).then (console.log('Connected to database !')).catch (err => console.log(err));
// Creating document schema and model
const contactSchema = {
    name: String,
    email: String,
    subject: String,
    message: String
};
const Contact = mongoose.model('Contact', contactSchema);


/* Basic endpoints for:
    1. / -- Checking server connection
    2. /contacts -- Collecting all current documents from database
 */
app.get('/', (req, res) => {
    res.status(200).send('Connection to server successful !')
});

app.get('/contacts', (req, res) => {
    Contact.find()
    .then (contacts => console.log(contacts))
    .then (contacts => res.json(contacts))
    .catch (err => console.log(err));
});


// POST endpoint for collecting user data and uploading to Mongo database
app.post('/send', (req, res) => {

    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    const mail = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: req.body.subject,
        text: 'DATACOM MONGODB DATA ENTRY HAS OCCURRED.'
    }

    const contactInfo = {
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message
    }

    try {
        Contact.create(contactInfo, function(err, doc) {
            console.log(err, doc);
            transporter.sendMail(mail, function(error, info) {
                if (error) {
                    console.log(error)
                    res.status(400).send("Unable to send email")
                } else {
                    res.status(201).send('Info sent to database');
                }
            })
        })
    } catch (error) {
        console.log(error) 
    } 

});


// Switch port at top of file
app.listen(port, () => console.log('Express server running on port', port));