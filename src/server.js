// Copyright (C) 2018 Don Kelly <karfai@gmail.com>
// Copyright (C) 2018 Hayk Pilosyan <hayk.pilos@gmail.com>

// This file is part of Interlibr, a functional component of an
// Internet of Rules (IoR).

// ACKNOWLEDGEMENTS
// Funds: Xalgorithms Foundation
// Collaborators: Don Kelly, Joseph Potvin and Bill Olders.

// This program is free software: you can redistribute it and/or
// modify it under the terms of the GNU Affero General Public License
// as published by the Free Software Foundation, either version 3 of
// the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public
// License along with this program. If not, see
// <http://www.gnu.org/licenses/>.
const _ = require('lodash');
const http = require('http');
const https = require('https');

function listen(app, ssl_opts=null) {
  let port = _.get(process.env, "PORT_API", 4200);
  
  app.set('port', port);
  
  let server = ssl_opts ? https.createServer(ssl_opts, app) : http.createServer(app);
  server.listen(port);
  server.on('error', (err) => {
    console.log(`! ${err}`);
  });
  server.on('listening', () => {
    console.log(`# listening (port=${port})`);
  });
}

module.exports = { listen };
