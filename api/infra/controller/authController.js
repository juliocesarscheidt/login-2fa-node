const UserService = require('../../application/service/userService');
const UserRepository = require('../repository/userRepository');
const DatabaseConnection = require('../adapter/databaseConnection');
const { encryptPassword, comparePasswordSync, generateToken, verify2faSecret } = require('../common/encryption');
const { httpLogger } = require('../middleware/httpLogger');
const BaseController = require('./baseController');

class AuthController extends BaseController {
  userService;

  constructor() {
    super();
    const databaseConnection = new DatabaseConnection();
    const userRepository = new UserRepository(databaseConnection);
    this.userService = new UserService(userRepository);
  }

  async signin(req, res) {
    const { email, password, token } = req.body;
    let result;
    try {
      result = await this.userService.findUserByEmail(email);
    } catch (err) {
      return AuthController.HandleError(res, err);
    }
    if (!comparePasswordSync(password, result.password)) {
      return AuthController.ResponseBadRequest(res, 'Invalid username or password');
    }
    // first signin
    if (!result?.secret) {
      const qrCode = await this.userService.generateUserSecretQrCode(result.id, email);
      return AuthController.ResponseOk(res, { qr_code: qrCode });
    }
    if (!token) {
      return AuthController.ResponseUnauthorized(res, 'Invalid token');
    }
    const verifyToken = verify2faSecret(result.secret, token);
    if (!verifyToken) {
      return AuthController.ResponseUnauthorized(res, 'Invalid token');
    }
    const accessToken = generateToken({ id: result.id, username: result.username, email });
    console.info('[INFO] accessToken', accessToken)
    return AuthController.ResponseOk(res, { access_token: accessToken });
  }

  async signup(req, res) {
    const { username, email, password } = req.body;
    const passwordEndrypted = encryptPassword(password);
    try {
      const id = await this.userService.createUser(username, email, passwordEndrypted);
      return AuthController.ResponseCreated(res, { id });
    } catch (err) {
      const message = err?.sqlMessage || err?.message;
      return AuthController.ResponseServerError(res, message);
    }
  }
}

module.exports = (router) => {
  const authController = new AuthController();
  router.post('/auth/signin', [httpLogger], async (req, res) => authController.signin(req, res));
  router.post('/auth/signup', [httpLogger], async (req, res) => authController.signup(req, res));
};
