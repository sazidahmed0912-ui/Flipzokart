"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const reviewController = new review_controller_1.ReviewController();
router.post('/', auth_middleware_1.protect, reviewController.createReview);
exports.default = router;
