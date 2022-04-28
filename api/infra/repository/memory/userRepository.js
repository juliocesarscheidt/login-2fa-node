class UserRepository {
  users;
  nextId;

  constructor() {
    this.users = [];
    this.nextId = 1;
  }

  async findById(id) {
    console.log('this.users', this.users);
    return this.users.find(u => u.id?.toString() === id.toString());
  }

  async findByEmail(email) {
    return this.users.find(u => u.email?.toString() === email.toString());
  }

  async update2faSecretById(id, secret) {
    const index = this.users.findIndex(u => u.id?.toString() === id.toString());
    const user = this.users[index];
    this.users.splice(index, 1, { ...user, secret });
  }

  async insertOne(username, email, passwordEndrypted) {
    const id = this.nextId++;
    this.users.push({ id, username, email, password: passwordEndrypted, secret: null });
    return id;
  }

  async deleteById(id) {
    const index = this.users.findIndex(u => u.id?.toString() === id.toString());
    this.users.splice(index, 1);
  }
}

module.exports = UserRepository;
