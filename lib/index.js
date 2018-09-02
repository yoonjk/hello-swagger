
const Handler = require('./handler');
const Oracle = require('./oracle')

module.exports = {
  handler: new Handler(),
  db: new Oracle(),
}
