const _ = require('lodash');
const uuid = require('uuid');

const SocketsServer = require('./sockets_server');

let subscribers = {
};

const server = new SocketsServer();

function add(topics) {
  let id = uuid();
  subscribers = _.set(subscribers, id, { topics });
  server.anticipate(id, (o) => {
    console.log(`# socket is connected (id=${id}; o=${JSON.stringify(o)})`);
    // TODO: remove this, it's just a test of server.send
    server.send(id, { topic: 'service', effect: 'test', payload: { a: 1, b: 2} });
  });
  return Promise.resolve(id);
}

function remove(id) {
  if (_.has(subscribers, id)) {
    subscribers = _.omit(subscribers, id);
    return Promise.resolve();
  }

  return Promise.reject({ reason: 'unknown_subscriber', message: `Failed to locate subscriber (id=${id})`});
}

module.exports = {
  add, remove
};
