'use strict';

const SwaggerExpress = require('swagger-express-mw');
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
const i18n = require('i18n');

i18n.configure({
  locales: ['en', 'ko'],
  directory: __dirname + '../locales',
  queryParameter: 'lang'
});


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

passport.use( new BasicStrategy(
  function(username, password, done) {
    console.log('connected login');
    const user = { username: username, password: password};
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

const SwaggerUi = require('swagger-tools/middleware/swagger-ui');
SwaggerExpress.create(swaggerConfig, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);
  app.use(SwaggerUi(swaggerExpress.runner.swagger));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  // passport
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/', router);
  app.use(i18n.init);
  app.route('/login')
   .get(function(req, res, next) {
     if (req.user) {
       res.send('already login');
     } else {
    res.sendFile(__dirname + '/login.html');
  }

router.get('/users',
  passport.authenticate('basic',{ session: false}),
  function( req, res ){
      console.log('match');
      res.end('Authorized ja');
  }
);
//passport custom callback
router.post('/login',
  function(req, res, next) {
    passport.authenticate('basic', function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.send({ status:"error" , message: 'Incorrect username/password'});
        return res.end();
      }
      res.send(user);
      res.end();

    })(req, res, next);
  }
);

})
  var port = process.env.PORT || 10010;
  server.listen(port, ()=> {
    console.log('express server listening on port:', port);
  });
});

passport.serializeUser(function (user, done) {
  done(null, user)
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});


function forwardToHttps(req, res, next) {
  if (req.get('X-Forwarded-Proto') === 'https') {
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
}

module.exports = server;
