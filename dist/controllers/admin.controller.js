"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const client_1 = require("@prisma/client");
const catchAsync_1 = require("../utils/catchAsync");
const prisma = new client_1.PrismaClient();
class AdminController {
    constructor() {
        this.getDashboardStats = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const totalSales = yield prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: { paymentStatus: 'COMPLETED' }, // Assuming only paid orders count
            });
            const totalOrders = yield prisma.order.count();
            const activeUsers = yield prisma.user.count({ where: { isVerified: true } });
            // Low stock products
            const lowStockProducts = yield prisma.product.count({
                where: { stock: { lt: 10 } },
            });
            res.status(200).json({
                status: 'success',
                data: {
                    totalSales: totalSales._sum.totalAmount || 0,
                    totalOrders,
                    activeUsers,
                    lowStockProducts,
                },
            });
        }));
    }
}
exports.AdminController = AdminController;
