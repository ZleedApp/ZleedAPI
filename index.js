require('dotenv').config();

const bodyParser = require('body-parser');
const expressJs  = require('express');
const mysql      = require('mysql2/promise');
const cors       = require('cors');
const fs         = require('fs');

const expressApp = expressJs();

expressApp.use(expressJs.json());
expressApp.use(bodyParser.urlencoded({ extended: true }));

expressApp.use(cors({ origin: '*', optionsSuccessStatus: 200 }));

const mySQLPool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 1000,
  queueLimit: 0
});

const endpointFiles = fs.readdirSync('./endpoints/v1').filter(file => file.endsWith('.js'));

endpointFiles.forEach(endpointFile => {
  const currentEndpoint = require(`./endpoints/v1/${endpointFile}`);

  currentEndpoint.addEndpoint(expressApp, mySQLPool);

  console.log(`[Zleed] API  : Added endpoint '${currentEndpoint.endpointName}'.`);
});

expressApp.get('/', async (req, res) => {
  console.log(`[Zleed] API  : New request to '${req.path}'.`);

  res.json({
    status: 1,
    message: 'Hello World',
    message_code: 'HELLO_WORLD',
    data: {
      apiVersion: 1,
      apiCodeName: 'Jellyfish'
    }
  });
});

expressApp.get('/status', async (req, res) => {
  console.log(`[Zleed] API  : New request to '${req.path}'.`);

  res.status(200);
  res.send('OK');
});

expressApp.listen(3004, () => {
  console.log(`[Zleed] API  : Bound to 0.0.0.0:${3004}.`);
});