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
