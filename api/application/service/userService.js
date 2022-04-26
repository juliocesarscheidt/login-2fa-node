const FindUser = require('../query/findUser');
const UpdateUserSecret = require('../usecase/updateUserSecret');
const InsertUser = require('../usecase/insertUser');

const InvalidUsernamePasswordException = require('../../domain/exception/invalidUsernamePasswordException');

const { generate2faSecret } = require('../../infra/common/encryption');

class UserService {
  findUser;

  constructor(userRepository) {
    this.findUser = new FindUser(userRepository);
    this.updateUserSecret = new UpdateUserSecret(userRepository);
    this.insertUser = new InsertUser(userRepository);
  }

  async findUserByEmail(email) {
    const result = await this.findUser.execute({ email });
    console.info('[INFO] result', result);
    if (!result) {
      // bad exception
      throw new InvalidUsernamePasswordException();
    }
    return result;
  }

  async unsetUserSecret(id) {
    await this.updateUserSecret.execute({ id, secret: null });
  }

  async generateUserSecretQrCode(id, email) {
    const secretObject = generate2faSecret(email);
    console.info('[INFO] secretObject', secretObject);
    // save secret on database
    await this.updateUserSecret.execute({ id, secret: secretObject.secret });
    return secretObject.qr;
  }

  async createUser(username, email, passwordEndrypted) {
    const result = await this.insertUser.execute({ username, email, passwordEndrypted });
    console.info('[INFO] result', result);
    return result.insertId;
  }
}

module.exports = UserService;
