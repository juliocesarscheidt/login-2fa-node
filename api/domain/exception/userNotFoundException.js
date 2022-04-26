class UserNotFoundException extends Error {
  constructor() {
    super('User not found');
  }
}

module.exports = UserNotFoundException;
