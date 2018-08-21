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
const axios = require('axios');
const WebSocket = require('ws');

let args = process.argv.slice(2);
console.log(args);
let cl = axios.create({
  baseURL: args[0]
});
let ws_url = args[1];
let topics = args.slice(2);

console.log(`> creating a subscription (topics=${topics})`);
cl.post('/subscriptions', { topics: topics }).then((res) => {
  if (200 == res.status) {
    console.log(`< got a subscription (id=${res.data.id}; url=${res.data.url})`);
    let url = `${ws_url}${res.data.url}`;
    console.log(`> connecting a websocket`);
    let ws = new WebSocket(url);
    ws.on('open', () => {
      console.log('< opened connection');
      ws.send(JSON.stringify({ name: 'confirm', payload: {} }));
    });
    ws.on('message', (m) => {
      console.log(`> received: ${m}`);
    });
  } else {
    console.log('! failed...');
  }

  process.on('SIGINT', () => {
    console.log(`# interrupt, unsubscribing (id=${res.data.id})`);
    cl.delete(`/subscriptions/${res.data.id}`).then(() => {
      console.log('< deleted, exiting');
      process.exit();
    }, (err) => {
      console.log(err);
      process.exit();
    });
  });
});



