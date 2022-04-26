class UserRepository {
  databaseConnection;

  constructor(databaseConnection) {
    this.databaseConnection = databaseConnection;
  }

  async findByEmail(email) {
    const [[result]] = await this.databaseConnection
      .query(`SELECT id, username, password, 2fa_secret AS secret FROM users WHERE email = ? LIMIT 1`, [email]);
    return result;
  }

  async update2faSecretById(id, secret) {
    await this.databaseConnection
      .query(`UPDATE users SET 2fa_secret = ? WHERE id = ?`, [secret, id]);
  }

  async insertOne(username, email, passwordEndrypted) {
    const [result] = await this.databaseConnection
      .query(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, passwordEndrypted]);
    return result;
  }

  async deleteById(id) {
    await this.databaseConnection
      .query(`DELETE FROM users WHERE id = ?`, [id]);
  }
}

module.exports = UserRepository;
