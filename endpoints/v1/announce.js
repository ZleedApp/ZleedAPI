module.exports = {
  endpointName: 'Announce',
  addEndpoint: (expressApp, mySQLPool) => {
    expressApp.post('/v1/announce/start', async (req, res) => {
      let [ rows ] = await mySQLPool.query("SELECT * FROM users WHERE `stream_token` = ?", [ req.body.name ]);

      const streamsRow = rows;

      if(streamsRow[0]) {
        console.log(`[Zleed] RTMP : Stream "${req.body.name}" started.`);

        let [ rows ] = await mySQLPool.query("SELECT * FROM users WHERE `uuid` = ?", [ streamsRow[0].uuid ]);

        await mySQLPool.query("UPDATE users SET `is_live`=1 WHERE `uuid` = ?", [ rows[0].uuid ])

        res.redirect(rows[0].username);

      } else {
        res.redirect('nouser');
      }
    });

    expressApp.post('/v1/announce/stop', async (req, res) => {
      let [ rows ] = await mySQLPool.query("SELECT * FROM users WHERE `stream_token` = ?", [ req.body.name ]);

      const streamsRow = rows;

      if(streamsRow[0]) {
        console.log(`[Zleed] RTMP : Stream "${req.body.name}" stopped.`);

        let [ rows ] = await mySQLPool.query("SELECT * FROM users WHERE `uuid` = ?", [ streamsRow[0].uuid ]);

        await mySQLPool.query("UPDATE users SET `is_live`=0 WHERE `uuid` = ?", [ rows[0].uuid ])

        res.redirect(rows[0].username);

      } else {
        res.redirect('nouser');
      }
    });
  }
}