const UserService = require('../../application/service/userService');
const BaseController = require('./baseController');

class UserController extends BaseController {
  userService;

  constructor(databaseConnection) {
    super();
    this.userService = new UserService(databaseConnection);
  }

  async me(req, res) {
    const tokenDecoded = UserController.extractTokenFromHeader(req, req);
    console.info('[INFO] tokenDecoded', tokenDecoded);
    try {
      const result = await this.userService.findUserById(tokenDecoded.id);
      return UserController.ResponseOk(res, result);
    } catch (err) {
      return UserController.HandleError(res, err);
    }
  }

  async secretReset(req, res) {
    const tokenDecoded = UserController.extractTokenFromHeader(req, req);
    console.info('[INFO] tokenDecoded', tokenDecoded);
    try {
      await this.userService.unsetUserSecret(tokenDecoded.id);
      return UserController.ResponseAccepted(res);
    } catch (err) {
      const message = err?.sqlMessage || err?.message;
      return UserController.ResponseServerError(res, message);
    }
  }
}

module.exports = UserController;
