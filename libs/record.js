var express = require('express');
var router = express.Router();
//use moment for date operations.
var moment = require('moment');

router.post('/getrecords', function (req, res) {
    //if not all the fields are given in request, give a failed response so the app will not crash.
    if (!('startDate' in req.body) || !('endDate' in req.body) || !('minCount' in req.body) || !('maxCount' in req.body)) {
        res.statusCode = 500;
        return res.json({ code: -1, msg: "Failure", error: "Please specify all the required fields." });
    }
    const startDate = moment(req.body.startDate, "YYYY-MM-DD");
    const endDate = moment(req.body.endDate, "YYYY-MM-DD");
    const minCount = req.body.minCount;
    const maxCount = req.body.maxCount;
    const recordsCollection = req.app.locals.recordsCollection;

    //find records within given dates' range and sort the found records in descending date order.
    recordsCollection.find({ createdAt: { '$gte': startDate.toDate(), '$lte': endDate.toDate() } }).sort({ createdAt: -1 }).toArray(function (err, records) {
        if (!err) {
            let recordArray = [];
            //find records' count field's summation. if summation is within given counts' range, add record to the json response.
            records.forEach(record => {
                sum = record.counts.reduce((pv, cv) => pv + cv, 0);
                if (sum > minCount && sum < maxCount) {
                    let recordJson = { key: record.key, createdAt: record.createdAt, totalCount: sum };
                    recordArray.push(recordJson);
                }
            });
            if (recordArray.length == 0) {
                res.statusCode = 404;
                return res.json({ code: -1, msg: "Failure", error: "Record not found" });
            }
            return res.json({ code: 0, msg: "Success", records: recordArray });
        }
        else {
            res.statusCode = 500;
            return res.json({ code: -1, msg: "Failure", error: 'Internal server error' });
        }
    })
});

module.exports = router;