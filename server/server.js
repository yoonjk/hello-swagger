'use strict';
const Promise = require('bluebird');
const SwaggerExpress = Promise.promisifyAll(require('swagger-express-mw'));
const express = require('express');
const session = require('express-session');
const http = require('http');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const { validate } = require('./auth');
const appEnv = require('cfenv').getAppEnv();
const app = express();
const server = http.createServer();
const router = require('./routes');
const {handler} = require('../lib');
const langResource = require('../locales/translations/en-US.json');
const upload = require('multer')({dest: 'upload/'});
app.set('trust rpoxy',1);
server.on('request', app);

const swaggerConfig = {
  appRoot: path.resolve(__dirname, '..'), // required config
  securityHandlers: {
    basicAuth: (req, auth, scope, next) =>
      passport.authenticate('basic', {session: false})(req, req.res, next),
  },
};


// session
app.use(session({resave: true, saveUninitialized: true, secret: 'Hello-Swagger', cookie: { secure: true, sameSite: true }}));


if (!appEnv.isLocal) {
  app.use(forwardToHttps);
}

handler.registerLanguages(langResource);
passport.use( new BasicStrategy(
  function(username, password, done) {
    console.log('connected login');
    const user = { username: username, password: password};
    console.log('user:', user);
    return done(null, user);
    /*
    validate(username, password)
      .then(user => {
        console.log('success login');
	return done(null, user)})
      .catch(err => {
        if (err.statusCode === 401 || err.statusCode === 404) {
          done(null, false);
        }
        done(err);
      });
    */
  }
));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    console.log('forbidden');
    res.sendStatus(403);
  }
}

console.log('local test:', handler.t('TRY_AGAIN'));

const SwaggerUi = require('swagger-tools/middleware/swagger-ui');
SwaggerExpress.createAsync(swaggerConfig).then(swaggerExpress=> {
  // install middleware
  app.use(morgan('short'));
  app.use(SwaggerUi(swaggerExpress.runner.swagger));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  // passport
  app.use(passport.initialize());
  app.use(passport.session());
//  handler.registerLanguages(translation);
  app.use('/auth', passport.authenticate('basic', {session: false}));
  app.use('/auth/login', ensureAuthenticated, function(req, res) {
    var somevalue = [{name: 'foo'},
      {name: 'bar'},
      {name: 'baz'}];
      res.send(somevalue);
  });


  swaggerExpress.register(app);
  var port = process.env.PORT || 10010;
  server.listen(port, ()=> {
    console.log('express server listening on port:', port);
  });
});

function forwardToHttps(req, res, next) {
  if (req.get('X-Forwarded-Proto') === 'https') {
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
}

module.exports = server;
