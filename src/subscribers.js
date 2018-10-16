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

const SocketsServer = require('./sockets_server');
const Consumer = require('./consumer');

const valid_topics = {
  audit : 'il.emit.audit',
  verification: 'il.emit.verification'
};

let subscribers = {
};

const server = new SocketsServer({
  closed: (id) => {
    console.log(`# trying to remove subscriber (id=${id})`);
    remove(id).then(() => {
      console.log(`# removed subscriber (id=${id})`);
    }, (err) => {
      console.log(`? problem removing subscriber (id=${id}; reason=${err.reason})`);
    });
  }
});

function add(topics) {
  let id = uuid();
  console.log(`# anticipating subscriber (topics=${topics}; id=${id})`);
  server.anticipate(id, (o) => {
    console.log(`# socket is connected (id=${id}; o=${JSON.stringify(o)})`);
    let kafka_topics = _.reduce(topics, (kts, topic) => {
      return _.has(valid_topics, topic) ? _.concat(kts, _.get(valid_topics, topic)) : kts;
    }, []);
    console.log(`# subscribing to kafka topics (topics=${_.join(kafka_topics, ', ')})`);
    let consumer = new Consumer(id, kafka_topics, (kt, m) => {
      let topic = _.get(_.invert(valid_topics), kt);
      console.log(`> message (kafka_topic=${kt}; topic=${topic}; m=${m})`);
      try {
        server.send(id, { topic: topic, effect: 'notified', payload: JSON.parse(m) });
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
    console.log(`# trying to remove consumer (id=${id})`);
    subscribers = _.omit(subscribers, id);
    if (consumer) {
      console.log(`# consumer existed, closing (id=${id})`);
      consumer.close();
    }
    return server.cancel(id);
  }

  return Promise.reject({ reason: 'unknown_subscriber', message: `Failed to locate subscriber (id=${id})`});
}

module.exports = {
  add, remove
};
