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
  }
}