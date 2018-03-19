const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';


// pg.connect(process.env.DATABASE_URL, function(err, client) {
//     if (err) throw err;
//     console.log('Connected to postgres! Getting schemas...');
//
//     client
//         .query('ALTER TABLE names ALTER COLUMN genre TYPE INT USING (trim(genre)::INT);')
//         .on('end', function() {client.end();});
//
// });

// pg.connect(process.env.DATABASE_URL, function(err, client) {
//     if (err) throw err;
//     console.log('Connected to postgres! Getting schemas...');
//
//     client
//         .query('CREATE TABLE name_frequency(id SERIAL PRIMARY KEY, name VARCHAR(100) not null, provincia VARCHAR(100) not null, total INT, permileage DECIMAL);')
//         .on('end', function() {client.end();});
//
// });