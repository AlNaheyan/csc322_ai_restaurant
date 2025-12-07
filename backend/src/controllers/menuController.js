const menuService = require('../services/menuService');

class MenuController {
  async getAll(req, res, next) {
    try {
      const filters = {
        chefId: req.query.chef_id,
        minPrice: req.query.min_price,
        maxPrice: req.query.max_price,
        minRating: req.query.min_rating,
        isVipOnly: req.query.vip_only,
        isAvailable: req.query.available !== 'false'
      };

      const items = await menuService.getAllMenuItems(filters);
      res.json(items);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const item = await menuService.getMenuItemById(req.params.id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  async getPopular(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const items = await menuService.getPopularItems(limit);
      res.json(items);
    } catch (error) {
      next(error);
    }
  }

  async getTopRated(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const items = await menuService.getTopRatedItems(limit);
      res.json(items);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const item = await menuService.createMenuItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const item = await menuService.updateMenuItem(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await menuService.deleteMenuItem(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MenuController();
