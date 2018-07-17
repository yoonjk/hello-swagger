'use strict';

const swaggerExpress = require('swagger-express-mw');
const app = require('express')();
const session = require('express-session');
const http = require('http');
const path = require('path');
const morgan = require('morgan');
const APIKEY=process.env.API_KEY;
const bodyParser = require('body-parser');
const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const { validate } = require('./auth');
const router = app.Router();
const appEnv = require('cfenv').getAppEnv();
const server = http.createServer();
const router = require('./routes/routes');
app.use('/', router);
router.init(app);

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

passport.use( new BasicStrategy(
  function(username, password, done) {
    validate(username, password)
      .then(user => done(null, user))
      .catch(err => {
        if (err.statusCode === 401 || err.statusCode === 404) {
          done(null, false);
        }
        done(err);
      });
  }
));



const SwaggerUi = require('swagger-tools/middleware/swagger-ui');
swaggerExpress.create(swaggerConfig, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);
  app.use(SwaggerUi(swaggerExpress.runner.swagger));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  // passport
  app.use(passport.initialize());
  app.use(passport.session());

  var port = process.env.PORT || 10010;
  app.listen(port);
    if (swaggerExpress.runner.swagger.paths['/hello']) {
      console.log(`try this:\ncurl Express server listening on port ${port}`);
    }
});



// swaggerExpress.create(swaggerConfig, function(err, swaggerExpress) {
//
//   // add swagger-ui (/docs)
//   app.use(SwaggerUi(swaggerExpress.runner.swagger));
//   app.use(bodyParser.json());
//   app.use(bodyParser.urlencoded({extended: false}));
//   // passport
//   app.use(passport.initialize());
//   app.use(passport.session());
//
//   swaggerExpress.register(app);
//
// });

//===============PASSPORT=================
// Passport session setup.
passport.serializeUser(function(user, done) {
  console.log("serializing " + user.username);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  done(null, obj);
});

function forwardToHttps(req, res, next) {
  if (req.get('X-Forwarded-Proto') === 'https') {
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
}

module.exports = server;
