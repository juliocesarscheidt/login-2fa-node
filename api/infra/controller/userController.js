const UserService = require('../../application/service/userService');
const UserRepository = require('../repository/userRepository');
const DatabaseConnection = require('../adapter/databaseConnection');
const { httpLogger } = require('../middleware/httpLogger');
const BaseController = require('./baseController');

class UserController extends BaseController {
  userService;

  constructor() {
    super();
    const databaseConnection = new DatabaseConnection();
    const userRepository = new UserRepository(databaseConnection);
    this.userService = new UserService(userRepository);
  }

  async me(req, res) {
    const tokenDecoded = UserController.extractTokenFromHeader(req, req);
    const user = { id: tokenDecoded.id, username: tokenDecoded.username, email: tokenDecoded.email };
    return UserController.ResponseOk(res, { user });
  }

  async me2faReset(req, res) {
    const tokenDecoded = UserController.extractTokenFromHeader(req, req);
    try {
      await this.userService.unsetUserSecret(tokenDecoded.id);
      return UserController.ResponseAccepted(res);
    } catch (err) {
      const message = err?.sqlMessage || err?.message;
      return UserController.ResponseServerError(res, message);
    }
  }
}

module.exports = (router) => {
  const userController = new UserController();
  router.get('/user/me', [httpLogger], async (req, res) => userController.me(req, res));
  router.put('/user/me/2fa/reset', [httpLogger], async (req, res) => userController.me2faReset(req, res));
};
