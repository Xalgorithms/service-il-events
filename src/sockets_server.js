const _ = require('lodash');
const uuid = require('uuid');
const WebSocket = require('ws');

function default_message(payload) {
  console.log(`# message/default (payload=${payload})`);
}

function extract_id(url, fn) {
  let id = _.last(_.split(url, '/'));
  if (id) {
    fn(id);
  } else {
    console.log(`! failed to extract an id (url=${url})`);
  }
}

function send_on_ws(ws, o) {
  ws.send(JSON.stringify(o));
}

function Server() {
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
        }
      });

      ws.on('close', () => {
        console.log(`# closed, removing socket (id=${id})`);
        sockets.live = _.omit(sockets.live, id);
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

      ws.close();

      return Promise.resolve();
    } else {
      return Promise.reject({ reason: 'no_socket', message: `No socket found (id=${id})` } );
    }
  }
  
  return { anticipate, cancel, send };
}

module.exports = Server;
