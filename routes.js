const express = require('express');
const router = express.Router();
const format = require('pg-format');
const pool = require('server/models/database');

router.get(function(req, res, next) {
    pool.connect(function (err, client, done) {
        if (err) throw new Error(err);
        var ageQuery = format('SELECT * from names');
        myClient.query(ageQuery, function (err, result) {
            if (err) throw new Error(err);
            res.json(result.rows[0]);
        })
    });
});

module.exports = router;