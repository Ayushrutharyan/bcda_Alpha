var express = require('express');
var router = express.Router();
const got = require('got');


router.get('/', function(req, res, next) {
  res.render('landing');
});


router.post('/getCreds', function(req, res, next) {
    req.session.username = req.body.username;
    req.session.password = req.body.password;

    console.log(req.session.username + " "+ req.session.password)

    res.redirect('/getAuth')
});




router.get('/getAuth', async function(req, res, next) {
  const {body} = await got.post('https://sandbox.bcda.cms.gov/auth/token', {
    headers:{
        'accept':'application/json'
    },
    username: req.session.username,
    password: req.session.password,
    responseType: 'json'
  })
  req.session.access_token = body.access_token;
  console.log(req.session.access_token)
  res.redirect('/selection')
});

module.exports = router;
