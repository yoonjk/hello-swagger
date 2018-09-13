
const Handler = require('./handler');
const {db} = require('./oracle')

module.exports = {
  handler: new Handler(),
  db: db,
}
