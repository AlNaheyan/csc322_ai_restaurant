const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const { authenticate, authorize } = require("../middleware/auth");

router.post(
  "/orders/:orderId/ratings",
  authenticate,
  authorize(["customer", "vip"]),
  ratingController.submitRating
);

router.get(
  "/employees/:employeeId/ratings",
  authenticate,
  ratingController.getEmployeeRatings
);

router.get(
  "/orders/:orderId/ratings",
  authenticate,
  ratingController.getOrderRatings
);

module.exports = router;
