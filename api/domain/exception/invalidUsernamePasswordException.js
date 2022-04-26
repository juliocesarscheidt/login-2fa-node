class InvalidUsernamePasswordException extends Error {
  constructor() {
    super('Invalid username or password');
  }
}

module.exports = InvalidUsernamePasswordException;
