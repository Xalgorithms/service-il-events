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

function extract_id(ws, fn) {
  let id = _.last(_.split(ws.upgradeReq.url), '/');
  if (id) {
    fn(id);
  } else {
    console.log(`! failed to extract an id (url=${ws.upgradeReq.url})`);
  }
}

function Server() {
  let wss = new WebSocket.Server(8888);
  let sockets = {
    anticipated: {},
    live: {}
  };

  const messages = {
    confirm: (id, payload, ws) => {
      console.log(`# message/confirm (payload=${payload})`);
      let fn = _.get(sockets.anticipated, id, null);
      if (fn) {
        sockets.anticipated = _.omit(sockets.anticipated, id);
        sockets.live = _.set(sockets.live, id, ws);
        fn(payload);
      } else {
        console.log(`? received confirmation for unanticipated socket (id=${id})`);
      }
    }
  };

  wss.on('connection', (ws) => {
    ws.on('message', (m) => {
      try {
        let o = JSON.parse(m);
        extract_id(ws, (id) => {
          let name = _.get(o, 'name', null);
          let fn = _.get(messages, name, () => {
            console.log(`! failed to find a handler for message (name=${name})`);
          });
          
          console.log(`# attempting to handle message (id=${id}; o=${o})`);
          fn(id, _.get(o, 'payload'), ws);
        });
      } catch (e) {
        console.log(`! failed to parse message`);
      }
    });
  });

  function anticipate(id, fn) {
    sockets.anticipated = _.set(sockets.anticipated, fn);
    return `/sockets/${id}`;
  }
  
  return { anticipate };
}

module.export = Server;
