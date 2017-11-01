const express = require('express');
const body_parser = require('body-parser');
const cors = require('cors');

const server = require('./server');
const subscribers = require('./subscribers');

function error(res) {
  return (err) => res.status(500).json(err);
}

function install_routes(app) {
  let router = express.Router();

  router.get('/status', (req, res) => {
    res.json({ status: 'live'});
  });

  router.post('/subscriptions', (req, res) => {
    subscribers.add(req.body.topics).then((id) => {
      res.json({ id });
    }, error(res));
  });

  router.delete('/subscriptions/:id', (req, res) => {
    subscribers.remove(req.params.id).then(() => {
      res.end();
    }, error(res));
  });

  app.use(router);
  
  return app;
}

function install_middleware(app) {
  app.use(body_parser.json());
  app.use(cors());
  return app;
}

function make_app() {
  let app = install_routes(install_middleware(express()));
  app.use((req, res) => {
    res.status(404).json({ reason: 'unhandled_request', message: `route not found (${req.originalUrl})`});
  });
  return app;
}

server.listen(make_app());
