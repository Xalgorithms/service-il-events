const _ = require('lodash');
const uuid = require('uuid');

const SocketsServer = require('./sockets_server');
const Consumer = require('./consumer');

let subscribers = {
};

const server = new SocketsServer();

function add(topics) {
  let id = uuid();
  server.anticipate(id, (o) => {
    console.log(`# socket is connected (id=${id}; o=${JSON.stringify(o)})`);
    let consumer = new Consumer(topics, (topic, m) => {
      console.log(`> message (topic=${topic}; m=${m})`);
      try {
        let o = JSON.parse(m);
        server.send(id, { topic: topic, effect: 'notified', payload: o });
      } catch (err) {
        console.log('failed to parse JSON');
        console.log(err);
      }
    });
    subscribers = _.set(subscribers, id, consumer);
  });
  return Promise.resolve(id);
}

function remove(id) {
  if (_.has(subscribers, id)) {
    let consumer = _.get(subscribers, id);
    subscribers = _.omit(subscribers, id);
    consumer.close();
    return server.cancel(id);
  }

  return Promise.reject({ reason: 'unknown_subscriber', message: `Failed to locate subscriber (id=${id})`});
}

module.exports = {
  add, remove
};
