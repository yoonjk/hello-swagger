'use strict';

const swaggerExpress = require('swagger-express-mw');
const app = require('express')();
const http = require('http');
const path = require('path');
const morgan = require('morgan');
const APIKEY=process.env.API_KEY;
const bodyParser = require('body-parser');
const appEnv = require('cfenv').getAppEnv();
const server = http.createServer();
const swaggerConfig = {
  appRoot: path.resolve(__dirname, '..'), // required config
  swaggerSecurityHandlers: {
    api_key: function (req, auth, scopesOrApiKey, cb) {
      // your security code
      console.log('scopesOrApiKey:',scopesOrApiKey)
      if (scopesOrApiKey === APIKEY) {
        cb();
      } else {
        cb(new Error('access denied!'));
      }
    }
  }
};

if (!appEnv.isLocal) {
  app.use(forwardToHttps);
}

swaggerExpress.create(swaggerConfig, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);
    if (swaggerExpress.runner.swagger.paths['/hello']) {
      console.log(`try this:\ncurl Express server listening on port ${port}`);
    }
});

const SwaggerUi = require('swagger-tools/middleware/swagger-ui');

swaggerExpress.create(swaggerConfig, function(err, swaggerExpress) {

  // add swagger-ui (/docs)
  app.use(SwaggerUi(swaggerExpress.runner.swagger));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  // install middleware
  swaggerExpress.register(app);

});



function forwardToHttps(req, res, next) {
  if (req.get('X-Forwarded-Proto') === 'https') {
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
}

module.exports = server;
