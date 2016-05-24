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

var serviceSync = mbaasSync({
  guid: 'PLACE_SERVICE_GUID_HERE',
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
