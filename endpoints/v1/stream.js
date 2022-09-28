module.exports = {
  endpointName: 'Stream',
  addEndpoint: (expressApp, mySQLPool) => {
    expressApp.post('/v1/stream/edit', async (req, res) => {

    });

    // will be useful when we introduce multiple locations such as "asia1".
    // "asia1" is planned to start operating while api v1 is still in use.
    expressApp.get('/v1/stream/get/:userName', async (req, res) => {
      const [ rows ] = await mySQLPool.query("SELECT * FROM users WHERE username = ?", [ req.params.userName ]);

      if(rows.length === 1) {
        if(rows[0].is_live === 1) {
          res.json({
            status: 1,
            message: 'User is online.',
            messageCode: 'USER_ONLINE',
            data: {
              streamTitle: rows[0].stream_title,
              streamGame: rows[0].stream_game,
              streamLanguage: rows[0].stream_language,
              hlsUri: `https://strmd.eu1.zleed.ga/${req.params.userName}.m3u8`, // strmd --> Stream Data, eu1 --> Region.
            },
          });
        } else {
          res.json({
            status: 0,
            message: 'User is offline.',
            messageCode: 'USER_OFFLINE',
            data: null
          });
        }
      } else {
        res.status(404)
        res.json({
          status: 0,
          message: 'User not found.',
          messageCode: 'USER_NOT_FOUND',
          data: null
        });
      }
    });

    // TODO: Use DB to get the data.
    expressApp.get('/v1/stream/regions', async (req, res) => {
      res.json({
        status: 1,
        message: 'Regions found.',
        messageCode: 'REGIONS_FOUND',
        data: [
          {
            regionName: 'Europe - Hungary, Budapest',
            regionCode: 'eu1',
            regionDomain: 'strmd.eu1.zleed.ga',
            regionOnline: 1
          },
          {
            regionName: 'Asia - Singapore',
            regionCode: 'asia1',
            regionDomain: 'strmd.asia1.zleed.ga',
            regionOnline: 0
          }
        ]
      });
    });
  }
}