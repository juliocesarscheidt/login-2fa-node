const UserService = require('../../application/service/userService');
const BaseController = require('./baseController');

class AuthController extends BaseController {
  userService;

  constructor(databaseConnection) {
    super();
    this.userService = new UserService(databaseConnection);
  }

  async signin(req, res) {
    const { email, password, token } = req.body;
    let result;
    let response;
    try {
      result = await this.userService.findUserByEmail(email);
    } catch (err) {
      return AuthController.HandleError(res, err);
    }
    if (!this.userService.compareUserPassword(password, result.password)) {
      return AuthController.ResponseBadRequest(res, 'Invalid username or password');
    }
    // first signin
    if (!result?.secret) {
      response = await this.userService.generateUserSecretQrCode(result.id, email);
      return AuthController.ResponseOk(res, response);
    }
    if (!token) {
      return AuthController.ResponseUnauthorized(res, 'Invalid token');
    }
    if (!this.userService.verifyUserSecret(result.secret, token)) {
      return AuthController.ResponseUnauthorized(res, 'Invalid token');
    }
    response = this.userService.generateUserToken(result.id, result.username, email);
    return AuthController.ResponseOk(res, response);
  }

  async signup(req, res) {
    const { username, email, password } = req.body;
    try {
      const response = await this.userService.createUser(username, email, password);
      return AuthController.ResponseCreated(res, response);
    } catch (err) {
      const message = err?.sqlMessage || err?.message;
      return AuthController.ResponseServerError(res, message);
    }
  }
}

module.exports = AuthController;
