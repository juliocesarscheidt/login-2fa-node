
const InvalidUsernamePasswordException = require('../../domain/exception/invalidUsernamePasswordException');
const UserNotFoundException = require('../../domain/exception/userNotFoundException');

const { decodeJwtToken } = require('../common/encryption');

class BaseController {
  constructor() {
  }

  static ResponseOk(res, data) {
    return res.status(200).json(data);
  }

  static ResponseCreated(res, data) {
    return res.status(201).json(data);
  }

  static ResponseAccepted(res) {
    return res.status(202).json();
  }

  static ResponseNoContent(res) {
    return res.status(204).json();
  }

  static ResponseBadRequest(res, message = 'Bad Request') {
    return res.status(400).json({ message });
  }

  static ResponseUnauthorized(res, message = 'Unauthorized') {
    return res.status(401).json({ message });
  }

  static ResponseNotFound(res, message = 'Not Found') {
    return res.status(404).json({ message });
  }

  static ResponseServerError(res, message = 'Internal Server Error') {
    return res.status(500).json({ message });
  }

  static HandleError(res, err) {
    console.error(err);

    if (err instanceof InvalidUsernamePasswordException) {
      return BaseController.ResponseBadRequest(res, err.message);

    } else if (err instanceof UserNotFoundException) {
      return BaseController.ResponseNotFound(res, err.message);

    } else {
      return BaseController.ResponseServerError(res);
    }
  }

  static extractTokenFromHeader(req, res) {
    const auth = req?.headers?.authorization;
    const token = auth && auth.replace('Bearer ', '');
    if (!token) {
      return BaseController.ResponseUnauthorized(res, 'Unauthorized - Invalid token');
    }
    const tokenDecoded = decodeJwtToken(token);
    if (!tokenDecoded) {
      return BaseController.ResponseUnauthorized(res, 'Unauthorized - Invalid token');
    }
    return tokenDecoded;
  }
}

module.exports = BaseController;
