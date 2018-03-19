'use strict';

var request = require('request'),
    cheerio = require('cheerio'),
    nameGen = {},
    names = [],
    pg = require('pg'),
    connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';

var url,
    names = [];

function getINEUrl(name, genre) {
    var ineUrl;

    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // genre -> 1 - men, 6 - women
    genre = (genre === 1) ? 6 : 1;

    ineUrl = 'http://www.ine.es/tnombres/formGeneralresult.do?L=0&vista=1&orig=ine&cmb4=99&cmb6=' + name + '&cmb7=' + genre + '&x=11&y=5';
    console.log(ineUrl);

    return ineUrl;
}

function insertFrequency(data, log) {

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
        var query = client.query("INSERT INTO name_frequency(name, provincia, total, permileage, genre) values($1, $2, $3, $4, $5)", [data.name, data.provincia, data.total, data.permileage, data.genre]);

        query.on('end', function() {
            done();
            if(log) {console.log('fin name ' + data.name);}
        });
    });
}

function insertFrequenciesUrl(name, url, genre) {
    request({
        url: url
    }, function (error, response, body) {
        // console.log(body);

        var $ = cheerio.load(body);
        var data = [];

        console.log('pre scrape', name);
        $('th', 'table[summary="resultados"] table[summary="resultados"] > tbody > tr.normal').each(function(i, elem) {
            var row = {name: '', provincia: '', total: 0, permileage: 0};
            row.name = name;
            row.genre = genre;
            row.provincia = $(this).text().trim();
            data[i] = row;
        });
        $('th + td', 'table[summary="resultados"] table[summary="resultados"] > tbody > tr.normal').each(function(i, elem) {
            var row = data[i];
            row.total = parseInt($(this).text().trim().replace('.',''));
            data[i] = row;
        });
        $('td + td', 'table[summary="resultados"] table[summary="resultados"] > tbody > tr.normal').each(function(i, elem) {
            var row = data[i];
            row.permileage = parseFloat($(this).text().trim().replace(',','.'));
            data[i] = row;
            if(i === data.length -1) {
                // console.log(data);
                for(var j = 0; j < data.length; j++) {
                    if(j === data.length - 1) {
                        console.log(data[j]);
                        insertFrequency(data[j], true);
                    } else {
                        console.log(data[j]);
                        insertFrequency(data[j], false);
                    }
                }
            }
        });

    });
}

function removeAllData() {

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Insert Data
        client.query("DELETE FROM name_frequency");

    });
}

function generateNameUrl() {

}

function getNames() {
    var results = [];

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        // // SQL Query > Get Names
        // var query = client.query("SELECT * FROM names ORDER BY id ASC;");
        //
        // // Stream results back one row at a time
        // query.on('row', function(row) {
        //     results.push(row);
        // });

        // After all data is returned, close connection and insert results in table
        // query.on('end', function() {
        //     done();
        //     // console.log(results);
        //     console.log(results.length);
        //     var interval = 2 * 1000; // 2 seconds;
        //     for (var i = 0; i <= results.length - 1; i++) {
        //         setTimeout( function (i) {
        //             console.log(i, results[i].name);
        //             url = getINEUrl(results[i].name, results[i].genre);
        //             insertFrequenciesUrl(results[i].name, url);
        //         }, interval * i, i);
        //     }
        //     // url = getINEUrl('Asunción', 2);
        //     // insertFrequenciesUrl('Asunción', url);
        //     // results.forEach(function(name) {
        //     //     if(name.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().substring(0, 1) !== 'a') { return;}
        //     //     url = getINEUrl(name.name, name.genre);
        //     //     insertFrequenciesUrl(name.name, url);
        //     // });
        // });

        // correct ambiguous names
        var names = [{name: 'Andrea', genre: 2},
            {name: 'Andrea', genre: 1},
            {name: 'Amable', genre: 2},
            {name: 'Amable', genre: 1},
            {name: 'Ariel', genre: 2},
            {name: 'Ariel', genre: 1},
            {name: 'Ascensión', genre: 2},
            {name: 'Ascensión', genre: 1},
            {name: 'Asunción', genre: 2},
            {name: 'Asunción', genre: 1},
            {name: 'Bautista', genre: 2},
            {name: 'Bautista', genre: 1},
            {name: 'Buenaventura', genre: 2},
            {name: 'Buenaventura', genre: 1},
            {name: 'Cruz', genre: 2},
            {name: 'Cruz', genre: 1},
            {name: 'Encarnación', genre: 2},
            {name: 'Encarnación', genre: 1},
            {name: 'Práxedes', genre: 2},
            {name: 'Práxedes', genre: 1},
            {name: 'Reyes', genre: 2},
            {name: 'Reyes', genre: 1},
            {name: 'Trinidad', genre: 2},
            {name: 'Trinidad', genre: 1}];

        var interval = 2 * 1000; // 2 seconds;
        for (var i = 0; i <= names.length - 1; i++) {
            setTimeout( function (i) {
                console.log(i, names[i].name);
                url = getINEUrl(names[i].name, names[i].genre);
                insertFrequenciesUrl(names[i].name, url, names[i].genre);
            }, interval * i, i);
        }
    });
}

    // select name from names where name not in (select name from name_frequency)  order by name asc;

// removeAllData();

// getNames();

// console.log(names);
//
// url = getINEUrl('Asunción', 2);
//
// insertFrequenciesUrl('Asunción', url);


module.exports = nameGen;