const http = require('http');
const https = require('https');

function listen(app, ssl_opts=null) {
  let port = '4200';
  
  app.set('port', port);
  
  let server = ssl_opts ? https.createServer(ssl_opts, app) : http.createServer(app);
  server.listen(port);
  server.on('error', (err) => {
    console.log(`! ${err}`);
  });
  server.on('listening', () => {
    console.log('# listening');
  });
}

module.exports = { listen };
