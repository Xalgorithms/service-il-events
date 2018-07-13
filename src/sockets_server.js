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
const uuid = require('uuid');
const WebSocket = require('ws');

function default_message(payload) {
  console.log(`# message/default (payload=${payload})`);
}

function extract_id(url, fn) {
  let id = _.last(_.split(url, '/'));
  if (id) {
    console.log(`# extracted id from url (url=${url}, id=${id})`);
    fn(id);
  } else {
    console.log(`! failed to extract an id (url=${url})`);
  }
}

function send_on_ws(ws, o) {
  ws.send(JSON.stringify(o));
}

function Server(events) {
  let wss = new WebSocket.Server({ port: 8888 });
  let sockets = {
    anticipated: {},
    live: {}
  };

  const messages = {
    confirm: (id, payload, ws) => {
      if (_.has(sockets.anticipated, id)) {
        let fn = _.get(sockets.anticipated, id, null);

        sockets.anticipated = _.omit(sockets.anticipated, id);
        sockets.live = _.set(sockets.live, id, ws);
        send_on_ws(ws, { topic: 'service', effect: 'registered', payload: { id } });

        if (fn) {
          fn(payload);
        }
      } else {
        console.log(`? received confirmation for unanticipated socket (id=${id})`);
      }
    }
  };

  wss.on('connection', (ws, req) => {
    extract_id(req.url, (id) => {
      ws.on('message', (m) => {
        try {
          let o = JSON.parse(m);
          let name = _.get(o, 'name', null);
          let fn = _.get(messages, name, () => {
            console.log(`! failed to find a handler for message (name=${name})`);
          });
          
          console.log(`# attempting to handle message (id=${id}; o=${JSON.stringify(o)})`);
          fn(id, _.get(o, 'payload'), ws);
        } catch (e) {
          console.log(`! failed to parse message`);
          console.log(e);
        }
      });

      ws.on('close', () => {
        console.log(`# closed, removing socket (id=${id})`);
        sockets.live = _.omit(sockets.live, id);
        _.get(events, 'closed', () => {})(id);
      });
    });
  });

  function anticipate(id, fn) {
    sockets.anticipated = _.set(sockets.anticipated, id, fn);
  }

  function send(id, o) {
    let ws = _.get(sockets.live, id, null);
    if (ws) {
      send_on_ws(ws, o);
    } else {
      console.log(`! failed to find live socket (id=${id})`);
    }
  }

  function cancel(id) {
    console.log(`# closing socket (id=${id})`);
    if (_.has(sockets.live, id)) {
      let ws = _.get(sockets.live, id, null);

      console.log(ws);
      ws.close();

      return Promise.resolve();
    } else {
      return Promise.reject({ reason: 'no_socket', message: `No socket found (id=${id})` } );
    }
  }
  
  return { anticipate, cancel, send };
}

module.exports = Server;
