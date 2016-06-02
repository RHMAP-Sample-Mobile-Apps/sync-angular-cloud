'use strict';

var express = require('express')
  , log = require('fh-bunyan').getLogger(__filename)
  , mbaasApi = require('fh-mbaas-api')
  , mbaasExpress = mbaasApi.mbaasExpress()
  , mbaasSync = require('fh-rest-sync-proxy')
  , app = module.exports = express();

// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys([]));
app.use('/mbaas', mbaasExpress.mbaas);

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

// Important that this is last!
app.use(mbaasExpress.errorHandler());

// This maps MBaaS Service guids to URLs during local development
process.env.FH_SERVICE_MAP = JSON.stringify({
  'fake-service-guid': 'http://127.0.0.1:9001'
});

// Proxy sync calls to an MBaaS Service with guid "fake-service-guid"
// Locally these calls are proxied to http://127.0.0.1:9001
var serviceSync = mbaasSync({
  guid: 'fake-service-guid',
  timeout: 20000
});

serviceSync.initDataset('users', {
  // Place the usual mbaasApi.sync options here
  sync_frequency: 60,
  logLevel: 'warn'
}, function (err) {
  if (err) {
    throw err;
  }

  var port = process.env.FH_PORT || process.env.VCAP_APP_PORT || 8001;
  app.listen(port, function() {
    log.info('App started at: %s on port: %s', new Date(), port);
  });
});
