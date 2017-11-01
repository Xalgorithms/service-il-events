const _ = require('lodash');
const uuid = require('uuid');

var subscribers = {
};

function add(topics) {
  let id = uuid();
  subscribers = _.set(subscribers, id, { topics });
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
