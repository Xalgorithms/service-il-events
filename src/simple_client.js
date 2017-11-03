const axios = require('axios');

let cl = axios.create({
  baseURL: 'http://localhost:4200/'
});

console.log('> creating a subscription');
cl.post('/subscriptions', { topics: [] }).then((res) => {
  if (200 == res.status) {
    console.log(`< got a subscription (id=${res.data.id}; url=${res.data.url})`);
  } else {
    console.log('! failed...');
  }
});

