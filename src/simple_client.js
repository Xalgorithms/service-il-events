const axios = require('axios');
const WebSocket = require('ws');

let cl = axios.create({
  baseURL: 'http://localhost:4200/'
});

console.log('> creating a subscription');
cl.post('/subscriptions', { topics: [] }).then((res) => {
  if (200 == res.status) {
    console.log(`< got a subscription (id=${res.data.id}; url=${res.data.url})`);
    let ws_url = `ws://localhost:8888${res.data.url}`;
    console.log(`> connecting a websocket`);
    let ws = new WebSocket(ws_url);
    ws.on('open', () => {
      console.log('< opened connection');
      ws.send(JSON.stringify({ name: 'confirm', payload: {} }));
    });
    ws.on('message', (m) => {
      console.log(`> received: ${m}`);
    });
  } else {
    console.log('! failed...');
  }

  process.on('SIGINT', () => {
    console.log(`# interrupt, unsubscribing (id=${res.data.id})`);
    cl.delete(`/subscriptions/${res.data.id}`).then(() => {
      console.log('< deleted, exiting');
      process.exit();
    }, (err) => {
      console.log(err);
      process.exit();
    });
  });
});



