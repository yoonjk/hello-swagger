
const express = require('express');
const router = express.Router();

router.get('/test', function (req, res, next) {
  res.send('list of users');
});

router.get('/example', function (req, res, next) {
  res.render('example.html')
});

router.get('/main', function (req, res, next) {
  console.log('pages/main')
  console.log(req.session)
  //res.sendFile('/views/main.html');
  res.render('main.html')
})

router.get('/login', function (req, res, next) {
  console.log('login')
  console.log(req.session.user)
  //res.sendFile('/views/main.html');
  res.render('login.html')
})

module.exports = router;
