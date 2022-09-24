const jwt = require("jsonwebtoken");
module.exports = {
  endpointName: 'Explore',
  addEndpoint: (expressApp, mySQLPool) => {
    expressApp.get('/v1/explore/live', async (req, res) => {
      const [ rows ] = await mySQLPool.query("SELECT * FROM users WHERE is_live = 1");

      if(rows.length > 0) {
        let liveUsers = [];

        rows.forEach((row) => {
          liveUsers.push({
            userId: row.uuid,
            userName: row.username,
            userDisplayName: row.display_name,
            userCreated: row.creation_date,
            streamData: {
              streamTitle: row.stream_title,
              streamGame: row.stream_game,
              streamLanguage: row.stream_language
            },
            isLive: row.is_live,
            isAdmin: row.is_admin
          });
        });

        res.json({
          status: 1,
          message: 'Live users found.',
          messageCode: 'LIVE_USERS_FOUND',
          data: liveUsers
        });
      } else {
        res.status(404);

        res.json({
          status: 1,
          message: 'No users are live right now.',
          messageCode: 'NO_LIVE_USERS_FOUND',
          data: null
        });
      }
    });

    expressApp.get('/v1/explore/all', async (req, res) => {
      const [ rows ] = await mySQLPool.query("SELECT * FROM users");

      if(rows.length > 0) {
        let liveUsers = [];

        rows.forEach((row) => {
          liveUsers.push({
            userId: row.uuid,
            userName: row.username,
            userDisplayName: row.display_name,
            userCreated: row.creation_date,
            streamData: {
              streamTitle: row.stream_title,
              streamGame: row.stream_game,
              streamLanguage: row.stream_language
            },
            isLive: row.is_live,
            isAdmin: row.is_admin
          });
        });

        res.json({
          status: 1,
          message: 'All users found.',
          messageCode: 'ALL_USERS_FOUND',
          data: liveUsers
        });
      } else {
        res.status(404);

        res.json({
          status: 1,
          message: 'No users found.',
          messageCode: 'NO_USERS_FOUND',
          data: null
        });
      }
    });

    expressApp.get('/v1/explore/following', async (req, res) => {
      const jwtToken   = req.headers.authorization.split(' ')[1];
      const jwtDecoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

      const [ rows ] = await mySQLPool.query("SELECT * FROM users WHERE uuid = ?", [ jwtDecoded.uuid ]);

      if(rows.length === 1) {
        const followingData = JSON.parse(rows[0].following_data);

        if(followingData.length > 0) {
          let followingUsers = [];

          for (const user of followingData) {
            const [ rows ] = await mySQLPool.query("SELECT * FROM users WHERE uuid = ?", [ user ]);

            if(rows.length === 1) {
              followingUsers.push({
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
              });
            }
          }

          res.json({
            status: 1,
            message: 'Following users found.',
            messageCode: 'FOLLOWING_USERS_FOUND',
            data: followingUsers
          });
        } else {
          res.status(404);

          res.json({
            status: 1,
            message: 'No users are being followed.',
            messageCode: 'NO_FOLLOWING_USERS_FOUND',
            data: null
          });
        }
      }
    });
  }
}