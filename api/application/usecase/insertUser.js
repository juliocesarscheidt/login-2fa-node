class InsertUser {
  userRepository;

  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ username, email, passwordEndrypted }) {
    const user = await this.userRepository.insertOne(username, email, passwordEndrypted);
    return user;
  }
}

module.exports = InsertUser;
