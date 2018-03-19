'use strict';

var request = require('request'),
    cheerio = require('cheerio'),
    nameGen = {},
    names = [],
    pg = require('pg'),
    connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';

var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
var url = '';

function getWikiUrls() {
    return alphabet.map(function(l){
        l = (l !== 'a') ? '/' + l : '';
        url = 'https://es.wikipedia.org/wiki/Wikiproyecto:Nombres_propios/libro_de_los_nombres' + l;
        // console.log(url);
        return url;
    });
}

function insertName(data) {

    var results = [];

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Insert Data
        client.query("INSERT INTO names(name, genre) values($1, $2)", [data.name, data.genre]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM names ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            //return res.json(results);
        });


    });
}

function removeAllNames() {

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Insert Data
        client.query("DELETE FROM names");

    });
}

function insertNamesUrl(url) {
    request({
        url: url
    }, function (error, response, body) {
        // console.log(body);

        var $ = cheerio.load(body);

        $('.mw-parser-output ul:nth-of-type(1) > li > a').each(function() {
            // console.log($(this).text().trim(), ', 2');
            insertName({ name:  $(this).text().trim(), genre: 2 });
        });
        $('.mw-parser-output ul:nth-of-type(2) > li > a').each(function() {
            // console.log($(this).text().trim(), ', 1');
            insertName({ name:  $(this).text().trim(), genre: 1 });
        });
        $('.mw-parser-output ul:nth-of-type(3) > li > a').each(function() {
            // console.log($(this).text().trim(), ', 3');
            insertName({ name:  $(this).text().trim(), genre: 3 });
        });
        return names;
    });
}

function insertNames() {
    console.log(alphabet);

    for(var i = 0; i < alphabet.length; i++) {
        insertNamesUrl(alphabet[i]);
    }
}

removeAllNames();

alphabet = getWikiUrls();

insertNames();


module.exports = nameGen;