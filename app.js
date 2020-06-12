const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const libs = process.cwd() + '/libs/';
const record = require(libs + 'record');
const config = require(libs + 'config');
const MongoClient = require('mongodb').MongoClient;
//define new MongoClient with url specified in config.json.
const mongoclient = new MongoClient(config.get('mongo:uri'), { useNewUrlParser: true });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/record', record);
app.set('port', process.env.PORT || config.get('port') || 1340);

app.use((req, res, next) => {
    const error = new Error("Address Not Found");
    error.status = 404;
    next(error);
});

// error handler middleware
app.use((error, req, res, next) => {
    console.log(error.message);
    res.status(error.status || 500).send({
        error: {
            status: error.status || 500,
            message: error.message || 'Internal Server Error',
        },
    });
});

mongoclient.connect(function (err, mongoclient) {
    if (err) {
        console.log("mongoerror", err);
    } else {
        console.log("connected");
        //store db collection as local variable.
        const db = mongoclient.db(config.get('mongo:dbname'));
        const recordsCollection = db.collection('records');
        app.locals.recordsCollection = recordsCollection;
        app.listen(app.get('port'), function () {
            console.log('Express server listening on port ' + app.get('port'));
        });
    }
});


