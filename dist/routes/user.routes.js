"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
// import { protect } from '../middlewares/auth.middleware'; // To be implemented
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);
// router.get('/user/profile', protect, userController.getProfile);
exports.default = router;
