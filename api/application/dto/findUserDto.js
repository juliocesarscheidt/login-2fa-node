class FindUserDto {
  id;
  username;
  email;
  password;
  secret;

  constructor({ id, username, email, password, secret }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.secret = secret;
  }
}

module.exports = FindUserDto;
