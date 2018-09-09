
const { verifyToken, issueToken } = require('./auth')
const validate = (username, password) => {
  return { username, password };
};


module.exports = {
  validate: validate,
  issueToken: issueToken,
  verifyToken: verifyToken,
}
