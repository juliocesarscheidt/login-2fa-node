class FindUser {
  userRepository;

  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ email }) {
    const user = await this.userRepository.findByEmail(email);
    return user;
  }
}

module.exports = FindUser;
