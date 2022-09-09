module.exports = {
  endpointName: 'Auth',
  addEndpoint: (expressApp, mySQLPool) => {
    const { v4: uuidv4 } = require('uuid');

    const jwt    = require('jsonwebtoken');
    const bcrypt = require('bcrypt');
    const crypto = require('crypto');

    const UrlSafeString = require('url-safe-string');

    const stringTrimmer = new UrlSafeString({
      maxLen:             50,
      lowercaseOnly:      true,
      regexRemovePattern: /((?!([a-z0-9])).)/gi,
      joinString:         '_',
      trimWhitespace:     true
    });

    expressApp.post('/v1/auth/login', async (req, res) => {
      const requestBody = req.body;

      if(!checkRequestBody(requestBody, 'login')) checkRequestBody(requestBody, 'login');

      const [ rows ] = await mySQLPool.query("SELECT * FROM users WHERE email = ?", [ requestBody.email ]);

      if(rows.length === 1) {
        const passwordMatch = await bcrypt.compare(requestBody.password, rows[0].password);

        const jwtToken      = jwt.sign({ uuid: rows[0].uuid, username: rows[0].username, email: rows[0].email }, process.env.JWT_SECRET, { algorithm: 'HS512', expiresIn: '30d' });
        const expiryDate    = new Date();

        expiryDate.setDate(expiryDate.getDate() + 30);

        if(passwordMatch) {
          res.json({
            status: 1,
            message: 'Successfully logged in the user.',
            messageCode: 'USER_FOUND',
            data: {
              jwtToken,
              jwtExpires: Math.floor(new Date(expiryDate).getTime() / 1000),
            }
          });
        } else {
          res.json({
            status: 0,
            message: 'The password is invalid.',
            messageCode: 'PASSWORD_INVALID',
            data: null
          });
        }
      } else {
        res.json({
          status: 0,
          message: 'The email is invalid.',
          messageCode: 'EMAIL_INVALID',
          data: null
        });
      }
    });

    expressApp.post('/v1/auth/register', async (req, res) => {
      const requestBody = req.body;

      if(!checkRequestBody(requestBody, 'register')) checkRequestBody(requestBody, 'register');

      const passwordSalt  = await bcrypt.genSalt(5);
      const passwordHash  = await bcrypt.hash(req.body.password, passwordSalt);

      const userUUID      = await uuidv4();

      const streamKey     = crypto.randomBytes(20).toString('hex');

      const jwtToken      = jwt.sign({ uuid: userUUID, username: requestBody.username, email: requestBody.email }, process.env.JWT_SECRET, { algorithm: 'HS512', expiresIn: '30d' });
      const expiryDate    = new Date();

      expiryDate.setDate(expiryDate.getDate() + 30);

      const [ err, rows ] = await mySQLPool.query(
        "INSERT INTO users (uuid, username, display_name, stream_token, stream_title, stream_game, stream_language, following_data, is_live, is_admin, email, password, creation_date) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,? FROM DUAL WHERE NOT EXISTS (SELECT username, email FROM users WHERE username = ? OR email = ?)",
        [
          userUUID,
          stringTrimmer.generate(requestBody.username),
          requestBody.username,
          streamKey,
          "Welcome to Zleed!",
          "zleed",
          "en",
          "[]",
          0,
          0,
          requestBody.email,
          passwordHash,
          Math.floor(new Date().getTime() / 1000),

          requestBody.username,
          requestBody.email
        ]);

      if (err.affectedRows === 1) {
        res.json({
          status: 1,
          message: 'User created.',
          messageCode: 'USER_CREATED',
          data: {
            jwtToken,
            jwtExpires: Math.floor(new Date(expiryDate).getTime() / 1000),
          }
        });
      } else {
        res.json({
          status: 0,
          message: 'The email is already in use.',
          messageCode: 'EMAIL_TAKEN',
          data: null
        });
      }
    });

    const checkRequestBody = (requestBody, endPoint) => {
      if(!requestBody.username && endPoint !== 'login') {
        return {
          status: 0,
          message: 'Username is required.',
          messageCode: 'USERNAME_REQUIRED',
          data: null
        };
      } else if(!requestBody.email) {
        return {
          status: 0,
          message: 'Email is required.',
          messageCode: 'EMAIL_REQUIRED',
          data: null
        };
      } else if(!requestBody.password) {
        return {
          status: 0,
          message: 'Password is required.',
          messageCode: 'PASSWORD_REQUIRED',
          data: null
        };
      } else {
        return true;
      }
    }
  }
}

/*
const token = jwt.sign(
        { id: uuidv4(), username: 'example', email: 'email@example.com' },
        process.env.JWT_SECRET,
        { algorithm: 'HS512', expiresIn: '30d' });
 */