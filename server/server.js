'use strict';
const Promise = require('bluebird');
const SwaggerExpress = Promise.promisifyAll(require('swagger-express-mw'));
const express = require('express');
const session = require('express-session');
const http = require('http');
const path = require('path');
const morgan = require('morgan');
const nocache = require('nocache')
const nosniff = require('dont-sniff-mimetype')
const bodyParser = require('body-parser');
const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const { validate, verifyToken } = require('./auth');
const appEnv = require('cfenv').getAppEnv();
const app = express();
const server = http.createServer();
const router = require('./routes');
const languageDetector = require('i18next-browser-languagedetector');
const i18n = require('i18n');
const sprintf = require('i18next-sprintf-postprocessor');
const upload = require('multer')({dest: 'upload/'});

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const SECRET = 'SECRET';
const auth = require('./auth/auth')

i18n.configure({
  locales:['en', 'ko'],
  directory: '../locales',
  register: global,
  defaultLocale: 'ko',
  cookie: 'lang',
  api: {
    '__': 't',  //now req.__ becomes req.t
    '__n': 'tn' //and req.__n can be called as req.tn
  },
});


app.set('trust proxy',1);
server.on('request', app);

const swaggerConfig = {
  appRoot: path.resolve(__dirname, '..'), // required config
  swaggerSecurityHandlers: {
    basicAuth: (req, auth, scope, next) =>
      passport.authenticate('basic', {session: false})(req, req.res, next),
    Bearer: (req, authOrSecDef, scopesOrApiKey, cb) => {
      console.log('Bearer:',authOrSecDef, scopesOrApiKey, req.body )
      verifyToken(req, authOrSecDef, scopesOrApiKey, cb)
    },
    apiKey: (req, authOrSecDef, scopesOrApiKey, cb) => {
      console.log('bearer:',authOrSecDef, scopesOrApiKey, req.body )
      console.log('api-key:',scopesOrApiKey )
      if (scopesOrApiKey === '1234') {
        cb();
      } else {
        cb(new Error('access denied!'));
      }
    },
  }
}


// session
app.use(session({resave: true, saveUninitialized: true, secret: 'Hello-Swagger', cookie: { secure: true, sameSite: true }}));


if (!appEnv.isLocal) {
  app.use(forwardToHttps);
}


passport.use( new BasicStrategy({
  passReqToCallback: true
},
  function(req, username, password, done) {
    console.log('connected login:', req.body);
    const user = {username: username, password: password}
   
    if (username === 'admin' && password === '1234') {
      console.log('user:', user);
      console.log('user:', req.body.user_type);
      return done(null, user);
    } else {
      return done (null, false)
    }
  }
));



const SwaggerUi = require('swagger-tools/middleware/swagger-ui');
SwaggerExpress.createAsync(swaggerConfig).then(swaggerExpress=> {
  // install middleware
  app.use(nocache())
  app.use(morgan('short'));
  app.use(nosniff())
 
  app.use(express.static(__dirname + '/../public'));
  app.set('views', path.join(__dirname, '/../public/views'));
  // Set EJS View Engine**
  app.set('view engine','ejs');
 // Set HTML engine**
  app.engine('html', require('ejs').renderFile);
  app.use(SwaggerUi(swaggerExpress.runner.swagger));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  // passport
  app.use(passport.initialize());
  app.use(passport.session());
  app.get('/main', (req, res) => {
    console.log('pages/main')
    //res.sendFile('/views/main.html');
    res.render('main.html')
  })


  swaggerExpress.register(app);
  var port = process.env.PORT || 10010;
  server.listen(port, ()=> {
    console.log('express server listening on port:', port);
  });
});
console.log("i18n : "+ t("TRY_AGAIN"));

function forwardToHttps(req, res, next) {
  if (req.get('X-Forwarded-Proto') === 'https') {
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
}

module.exports = server;
