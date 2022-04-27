class InsertUser {
  userRepository;

  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ username, email, passwordEndrypted }) {
    const result = await this.userRepository.insertOne(username, email, passwordEndrypted);
    return result;
  }
}

module.exports = InsertUser;
