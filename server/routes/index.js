const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';

// router.get('/', function(req, res, next) {
//     res.sendFile(path.join(
//     __dirname, '..', '..', 'client', 'views', 'index.html'));
// });

router.use(function(req, res, next) {

    // log each request to the console
    console.log(req.method, req.url);
    console.log(req.headers['content-type']);
    console.log(req.body);

    // continue doing what we were doing and go to the route
    next();
});

router.get('/api/v1/names', function(req, res) {

    var results = [];

    var genre = req.query.genre,
        search_name = req.query.search_name,
        name = req.query.name;
    console.log('req', req.query.genre);
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        var stringQuery = "SELECT * FROM names";
        var query;
        if(genre && !search_name && !name) {
            stringQuery += " WHERE genre=($1) ORDER BY name ASC;";
            query = client.query(stringQuery, [genre]);
        } else if(search_name && !genre) {
            stringQuery += " WHERE LOWER(name) LIKE $1 ORDER BY name ASC;";
            query = client.query(stringQuery, ['%' + search_name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() + '%']);
        } else if (search_name && genre){
            stringQuery += " WHERE genre=($1) AND LOWER(name) LIKE $2 ORDER BY name ASC;";
            query = client.query(stringQuery, [genre, '%' + search_name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() + '%']);
        } else if(name && genre) {
            stringQuery = "SELECT * FROM names WHERE LOWER(name)=($1) AND genre=($2)";
            query = client.query(stringQuery, [name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase(), genre]);
        } else if(name && !genre) {
            stringQuery = "SELECT * FROM names WHERE LOWER(name)=($1)";
            query = client.query(stringQuery, [name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()]);
        } else if(!name && genre) {
            stringQuery = "SELECT * FROM names WHERE genre=($1)";
            query = client.query(stringQuery, [genre]);
        }
        else {
            stringQuery += " ORDER BY name ASC;";
            query = client.query(stringQuery);
        }

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });

});

router.post('/api/v1/names', function(req, res) {

    var results = [];

    console.log(req.body.text);
    // Grab data from http request
    var data = {name: req.body.name, genre: req.body.genre};

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
        var query = client.query("SELECT * FROM names ORDER BY name ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });


    });
});

router.put('/api/v1/names/:name_id', function(req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.name_id;

    // Grab data from http request
    var data = {name: req.body.name, genre: req.body.genre};

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).send(json({ success: false, data: err}));
        }

        // SQL Query > Update Data
        client.query("UPDATE names SET name=($1), genre=($2) WHERE id=($2)", [data.name, data.genre, id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM names ORDER BY name ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });

});

router.delete('/api/v1/names/:name_id', function(req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.name_id;


    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Delete Data
        client.query("DELETE FROM names WHERE id=($1)", [id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM names ORDER names id ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });

});

router.get('/api/v1/frequency', function(req, res) {

    var results = [];

    var search_provincia = req.query.search_provincia,
        search_name = req.query.search_name,
        name = req.query.name,
        provincia = req.query.provincia;

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        // var query = client.query("SELECT * FROM name_frequency ORDER BY id ASC;");
        var stringQuery = "SELECT * FROM name_frequency";
        var query;
        if(search_provincia && !search_name) {
            stringQuery += " WHERE LOWER(provincia) LIKE $1 ORDER BY id ASC;";
            query = client.query(stringQuery, ['%' + search_provincia.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() + '%']);
        } else if(search_name && !search_provincia) {
            stringQuery += " WHERE LOWER(name) LIKE $1 ORDER BY id ASC;";
            query = client.query(stringQuery, ['%' + search_name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() + '%']);
        } else if (search_name && search_provincia){
            stringQuery += " WHERE LOWER(provincia) LIKE $1 AND LOWER(name) LIKE $2 ORDER BY id ASC;";
            query = client.query(stringQuery, ['%' + search_provincia.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() + '%', '%' + search_name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() + '%']);
        } else if(name && provincia) {
            stringQuery = "SELECT * FROM name_frequency WHERE LOWER(name)=($1) AND LOWER(provincia)=($2)";
            query = client.query(stringQuery, [name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase(), provincia.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()]);
        } else if(name && !provincia) {
            console.log('in name');
            stringQuery = "SELECT * FROM name_frequency WHERE LOWER(name)=($1)";
            query = client.query(stringQuery, [name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()]);
        } else if(!name && provincia) {
            stringQuery = "SELECT * FROM name_frequency WHERE LOWER(provincia)=($1)";
            query = client.query(stringQuery, [provincia.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()]);
        }
        else {
            stringQuery += " ORDER BY id ASC;";
            query = client.query(stringQuery);
        }

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            console.log(results.length);
            return res.json(results);
        });

    });

});

router.post('/api/v1/frequency', function(req, res) {

    var results = [];

    console.log(req.body.text);
    // Grab data from http request
    var data = {name: req.body.name, provincia: req.body.provincia, total: req.body.total, permileage: req.body.permileage};

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Insert Data
        client.query("INSERT INTO name_frequency(name, provincia, total, permileage) values($1, $2, $3, $4)", [data.name, data.provincia, data.total, data.permileage]);
        // TABLE name_frequency(id SERIAL PRIMARY KEY, name VARCHAR(100) not null, provincia VARCHAR(100) not null, total INT, permileage DECIMAL)

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM name_frequency ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });


    });
});

router.put('/api/v1/frequency/:frequency_id', function(req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.frequency_id;

    // Grab data from http request
    var data = {name: req.body.name, provincia: req.body.provincia, total: req.body.total, permileage: req.body.permileage};

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).send(json({ success: false, data: err}));
        }

        // SQL Query > Update Data
        client.query("UPDATE name_frequency SET name=($1), provincia=($2), total=($3), permileage=($4) WHERE id=($5)", [data.name, data.provincia, data.total, data.permileage, id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM name_frequency ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });

});

router.delete('/api/v1/frequency/:frequency_id', function(req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.frequency_id;


    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Delete Data
        client.query("DELETE FROM name_frequency WHERE id=($1)", [id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM name_frequency ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });

});

module.exports = router;