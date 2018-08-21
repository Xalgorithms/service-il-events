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

const url = _.get(process.env, 'KAFKA_BROKER', 'localhost:9092');

function Consumer(id, topics, fn) {
  console.log(`# creating consumer group (subscriber_id=${id}; url=${url}; topics=${topics})`);
  
  let consumer = new kafka.ConsumerGroup({ kafkaHost: url, groupId: `service-events-subscriber-${id}` }, topics);

  consumer.on('message', (m) => {
    console.log(`> message received (subscriber_id=${id}; topic=${m.topic}; value=${m.value})`);
    fn(m.topic, m.value);
  });
  
  consumer.on('error', (err) => {
    console.log(err);
  });

  function close() {
    consumer.close(() => {
      console.log(`# closed consumer for subscriber (id=${id})`);
    });
  }
  
  return { close };
}

module.exports = Consumer;
