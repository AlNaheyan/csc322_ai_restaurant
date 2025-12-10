const ratingService = require('../services/ratingService');

class RatingController {
  async submitRating(req, res) {
    try {
      const customerId = req.user.customerId;
      const { orderId } = req.params;
      const ratingData = req.body;

      const rating = await ratingService.submitRating(customerId, orderId, ratingData);

      res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: rating
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getEmployeeRatings(req, res) {
    try {
      const { employeeId } = req.params;

      const ratings = await ratingService.getRatingsForEmployee(employeeId);

      res.json({
        success: true,
        data: ratings
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getOrderRatings(req, res) {
    try {
      const { orderId } = req.params;

      const ratings = await ratingService.getRatingsForOrder(orderId);

      res.json({
        success: true,
        data: ratings
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new RatingController();
