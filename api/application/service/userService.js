const FindUser = require('../query/findUser');
const UpdateUserSecret = require('../usecase/updateUserSecret');
const InsertUser = require('../usecase/insertUser');
const CreateUserDto = require('../dto/createUserDto');
const UserQrCodeDto = require('../dto/userQrCodeDto');
const UserTokenDto = require('../dto/userTokenDto');
const FindUserDto = require('../dto/findUserDto');

const UserRepository = require('../../infra/repository/database/userRepository');
// const UserRepository = require('../../infra/repository/memory/userRepository');

const InvalidUsernamePasswordException = require('../../domain/exception/invalidUsernamePasswordException');
const UserNotFoundException = require('../../domain/exception/userNotFoundException');

const { encryptPassword, comparePasswordSync, generateToken, generate2faSecret, verify2faSecret } = require('../../shared/common/encryption');

class UserService {
  findUser;

  constructor(databaseConnection) {
    const userRepository = new UserRepository(databaseConnection);
    this.findUser = new FindUser(userRepository);
    this.updateUserSecret = new UpdateUserSecret(userRepository);
    this.insertUser = new InsertUser(userRepository);
  }

  async findUserById(id) {
    const result = await this.findUser.execute({ id });
    console.info('[INFO] findUserById result', result);
    if (!result) throw new UserNotFoundException();
    return new FindUserDto({ id: result.id, username: result.username, email: result.email });
  }

  async findUserByEmail(email) {
    const result = await this.findUser.execute({ email });
    console.info('[INFO] findUserByEmail result', result);
    if (!result) throw new InvalidUsernamePasswordException();
    return new FindUserDto(result);
  }

  compareUserPassword(passwordSource, passwordTarget) {
    return comparePasswordSync(passwordSource, passwordTarget);
  }

  verifyUserSecret(secret, token) {
    return verify2faSecret(secret, token);
  }

  generateUserToken(id, username, email) {
    const result = generateToken({ id, username, email });
    console.info('[INFO] generateUserToken result', result);
    return new UserTokenDto(result);
  }

  async unsetUserSecret(id) {
    await this.updateUserSecret.execute({ id, secret: null });
  }

  async generateUserSecretQrCode(id, email) {
    const secretObject = generate2faSecret(email);
    console.info('[INFO] generateUserSecretQrCode secretObject', secretObject);
    // persist secret on database
    await this.updateUserSecret.execute({ id, secret: secretObject.secret });
    return new UserQrCodeDto(secretObject.qr);
  }

  async createUser(username, email, password) {
    const passwordEndrypted = encryptPassword(password);
    const result = await this.insertUser.execute({ username, email, passwordEndrypted });
    console.info('[INFO] createUser result', result);
    return new CreateUserDto(result);
  }
}

module.exports = UserService;
