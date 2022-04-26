class UpdateUserSecret {
  userRepository;

  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ id, secret }) {
    await this.userRepository.update2faSecretById(id, secret);
  }
}

module.exports = UpdateUserSecret;
