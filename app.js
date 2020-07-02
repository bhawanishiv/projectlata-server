const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const admin = require('firebase-admin');

app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


const serviceAccount = require('./project-lata-firebase-adminsdk-t3zqd-bf2be61d49.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://project-lata.firebaseio.com"
});

const devRoutes = require('./api/routes/dev');
app.use('/dev', devRoutes);

app.use((req, res, next) => {
    error = new Error('not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        error: {
            message: error.message
        }
    })

})
module.exports = app;