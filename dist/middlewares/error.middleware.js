"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const globalErrorHandler = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof AppError_1.AppError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Something went wrong';
        error = new AppError_1.AppError(message, statusCode);
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        status: error.status || 'error',
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};
exports.globalErrorHandler = globalErrorHandler;
