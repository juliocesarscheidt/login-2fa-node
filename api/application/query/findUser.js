class FindUser {
  userRepository;

  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ id, email }) {
    let user;
    if (id) {
      user = await this.userRepository.findById(id);
    } else if (email) {
      user = await this.userRepository.findByEmail(email);
    }
    return user;
  }
}

module.exports = FindUser;
