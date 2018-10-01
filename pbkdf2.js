var crypto = require('crypto');
var salt_hex = '1427f23fd32f8f9902768e7ab7c7ffad';
var key_hex = 'de3259de39fcc55531b91b4ffb2a6c29005c674cc95b3ec5bdf18412b6087d05921f3a0e4148fc34c88a04e980481d397a4c2b143edc0cb1bb5d7434ca3b4c25';
var salt = new Buffer(salt_hex, 'hex');
crypto.pbkdf2('anacleto', salt, 1, 512/8, 'sha512', function (err, key) {
  if (err)
    throw err;
  var x = key.toString('hex');
  var y = key_hex;
  console.log('x:', x);
  console.log('y:', y);
  console.assert(x === y, '\n' + x + '\n !== \n' + y);
});
