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

let args = _.slice(process.argv, 2);
console.log(`# listening (url=${args[0]}, topic=${args[1]})`);

let pr = new Promise((resolve, reject) => {
  let consumer = new kafka.ConsumerGroup({ kafkaHost: args[0], groupId: `events-validate-kafka` }, [args[1]]);

  consumer.on('message', (m) => {
    console.log(`> message received (topic=${m.topic}; value=${m.value})`);
    resolve(true);
  });
  
  consumer.on('error', (err) => {
    console.log('! consumer error');
    console.log(err);
    resolve(false);
  });
});

console.log('waiting');
pr.then((res) => {
  console.log('finished');
});

