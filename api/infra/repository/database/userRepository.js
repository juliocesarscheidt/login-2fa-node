class UserRepository {
  databaseConnection;

  constructor(databaseConnection) {
    this.databaseConnection = databaseConnection;
  }

  async findById(id) {
    const [[result]] = await this.databaseConnection
      .query(`SELECT id, username, email, password, secret FROM users WHERE id = ? LIMIT 1`, [id]);
    return result;
  }

  async findByEmail(email) {
    const [[result]] = await this.databaseConnection
      .query(`SELECT id, username, email, password, secret FROM users WHERE email = ? LIMIT 1`, [email]);
    return result;
  }

  async update2faSecretById(id, secret) {
    await this.databaseConnection
      .query(`UPDATE users SET secret = ? WHERE id = ?`, [secret, id]);
  }

  async insertOne(username, email, passwordEndrypted) {
    const [result] = await this.databaseConnection
      .query(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, passwordEndrypted]);
    return result.insertId;
  }

  async deleteById(id) {
    await this.databaseConnection
      .query(`DELETE FROM users WHERE id = ?`, [id]);
  }
}

module.exports = UserRepository;
