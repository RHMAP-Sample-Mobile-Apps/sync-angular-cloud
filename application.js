'use strict';

const express = require('express');
const log = require('fh-bunyan').getLogger(__filename);
const mbaasApi = require('fh-mbaas-api');
const mbaasExpress = mbaasApi.mbaasExpress();
const mbaasSync = require('fh-rest-sync-proxy');
const app = module.exports = express();

// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys([]));
app.use('/mbaas', mbaasExpress.mbaas);

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

// Important that this is last!
app.use(mbaasExpress.errorHandler());

// This maps MBaaS Service guids to URLs during local development
process.env.FH_USE_LOCAL_DB = true;
process.env.FH_SERVICE_MAP = JSON.stringify({
  'afake-service-guid-12345': 'http://127.0.0.1:9001'
});

// Proxy sync calls to an MBaaS Service with guid "fake-service-guid"
// Locally these calls are proxied to http://127.0.0.1:9001
var serviceSync = mbaasSync({
  guid: 'afake-service-guid-12345',
  timeout: 20000
});

serviceSync.initDataset('users', {
  // Place the usual mbaasApi.sync options here
  logLevel: 'warn'
}, function (err) {
  if (err) {
    throw err;
  }

  const port = process.env.FH_PORT || process.env.VCAP_APP_PORT || 8001;
  app.listen(port, function() {
    log.info('App started at: %s on port: %s', new Date(), port);
  });
});
