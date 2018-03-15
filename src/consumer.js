const _ = require('lodash');
const kafka = require('kafka-node');
const Client = kafka.Client;
const HighLevelConsumer = kafka.HighLevelConsumer;

const zookeeper_url = _.get(process.env, 'ZOOKEEPER_URL', 'localhost');

console.log(`> connecting to kafka via zookeeper (zookeeper_url=${zookeeper_url})`);
const cl = new Client(zookeeper_url);
console.log('< connected');

const opts = {
  autoCommit: true,
  fetchMaxWaitMs: 1000  
};

function Consumer(topics, fn) {
  console.log(`# creating high-level consumer (topics=${topics})`);
  
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
