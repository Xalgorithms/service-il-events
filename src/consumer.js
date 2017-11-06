const _ = require('lodash');
const kafka = require('kafka-node');
const Client = kafka.Client;
const HighLevelConsumer = kafka.HighLevelConsumer;

const cl = new Client('localhost:2181');
const opts = {
  autoCommit: true,
  fetchMaxWaitMs: 1000  
};

function Consumer(topics, fn) {
  let consumer = new HighLevelConsumer(cl, _.map(topics, (n) => {
    return { topic: n };
  }), opts);

  consumer.on('message', (m) => {
    fn(m.topic, m.value);
  });
  
  consumer.on('error', (err) => {
    console.log(err);
  });

  function close() {
    consumer.close();
  }
  
  return { close };
}

module.exports = Consumer;
