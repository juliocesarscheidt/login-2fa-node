const AuthController = require('../../infra/controller/authController');
const UserController = require('../../infra/controller/userController');
const { httpLogger } = require('../../infra/middleware/httpLogger');

class Router {
  httpRouter;
  authController;
  userController;

  constructor(httpRouter, databaseConnection) {
    this.httpRouter = httpRouter;
    this.authController = new AuthController(databaseConnection);
    this.userController = new UserController(databaseConnection);
    this.setupRoutes();
  }

  setupRoutes() {
    // auth
    this.httpRouter.post('/auth/signin', [httpLogger], async (req, res) => this.authController.signin(req, res));
    this.httpRouter.post('/auth/signup', [httpLogger], async (req, res) => this.authController.signup(req, res));
    // user
    this.httpRouter.get('/user/me', [httpLogger], async (req, res) => this.userController.me(req, res));
    this.httpRouter.put('/user/me/secret_reset', [httpLogger], async (req, res) => this.userController.secretReset(req, res));
  }
}

module.exports = Router;
