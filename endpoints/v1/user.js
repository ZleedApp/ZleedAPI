const jwt = require("jsonwebtoken");
module.exports = {
  endpointName: 'User',
  addEndpoint: (expressApp, mySQLPool) => {
    const jwt = require('jsonwebtoken');

    expressApp.get('/v1/user/@me', async (req, res) => {
      const jwtToken   = req.headers.authorization.split(' ')[1];
      const jwtDecoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

      const [ rows ] = await mySQLPool.query("SELECT * FROM users WHERE uuid = ?", [ jwtDecoded.uuid ]);

      if(rows.length === 1) {
        res.json({
          status: 1,
          message: 'User found.',
          messageCode: 'USER_FOUND',
          data: {
            userId: rows[0].uuid,
            userName: rows[0].username,
            userDisplayName: rows[0].display_name,
            userEmail: rows[0].email,
            userCreated: rows[0].creation_date,
            streamData: {
              streamToken: rows[0].stream_token,
              streamTitle: rows[0].stream_title,
              streamGame: rows[0].stream_game,
              streamLanguage: rows[0].stream_language
            },
            followingData: JSON.parse(rows[0].following_data),
            isLive: rows[0].is_live,
            isAdmin: rows[0].is_admin
          }
        });
      } else {
        res.json({
          status: 0,
          message: 'User not found.',
          messageCode: 'USER_NOT_FOUND',
          data: null
        });
      }
    });

    expressApp.get('/v1/user/:userName', async (req, res) => {
      const [ rows ] = await mySQLPool.query("SELECT * FROM users WHERE username = ?", [ req.params.userName ]);

      if(rows.length === 1) {
        res.json({
          status: 1,
          message: 'User found.',
          messageCode: 'USER_FOUND',
          data: {
            userId: rows[0].uuid,
            userName: rows[0].username,
            userDisplayName: rows[0].display_name,
            userCreated: rows[0].creation_date,
            streamData: {
              streamTitle: rows[0].stream_title,
              streamGame: rows[0].stream_game,
              streamLanguage: rows[0].stream_language
            },
            isLive: rows[0].is_live,
            isAdmin: rows[0].is_admin
          }
        });
      } else {
        res.json({
          status: 0,
          message: 'User not found.',
          messageCode: 'USER_NOT_FOUND',
          data: null
        });
      }
    });

    expressApp.post('/v1/user/:userName/follow', async (req, res) => {
      const jwtToken   = req.headers.authorization.split(' ')[1];
      const jwtDecoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

      let [ rows ] = await mySQLPool.query("SELECT * FROM users WHERE uuid = ?", [ jwtDecoded.uuid ]);
      let rowsUser = rows;

      if(rowsUser.length === 1) {
        let followingData = JSON.parse(rowsUser[0].following_data);

        let [ rows ] = await mySQLPool.query("SELECT * FROM users WHERE username = ?", [ req.params.userName ]);

        if(rows.length === 1) {
          if(followingData.includes(rows[0].uuid)) {
            const newFollowingData = followingData.filter(data => data !== rows[0].uuid);

            await mySQLPool.query("UPDATE users SET following_data = ? WHERE uuid = ?", [ JSON.stringify(newFollowingData), jwtDecoded.uuid ]);

            res.json({
              status: 1,
              message: 'You are no longer following this user.',
              messageCode: 'UN_FOLLOWING_USER',
              data: null
            });
          } else {
            followingData.push(rows[0].uuid);

            await mySQLPool.query("UPDATE users SET following_data = ? WHERE uuid = ?", [ JSON.stringify(followingData), jwtDecoded.uuid ]);

            res.json({
              status: 1,
              message: 'You are now following this user.',
              messageCode: 'FOLLOWING_USER',
              data: null
            });
          }
        }
      } else {
        res.json({
          status: 0,
          message: 'User not found.',
          messageCode: 'USER_NOT_FOUND',
          data: null
        });
      }
    });
  }
}