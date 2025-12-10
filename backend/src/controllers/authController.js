const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.registerVisitor(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res) {
    res.json({ message: 'Logged out successfully' });
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
