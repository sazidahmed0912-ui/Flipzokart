"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const client_1 = require("@prisma/client");
const catchAsync_1 = require("../utils/catchAsync");
const prisma = new client_1.PrismaClient();
class AdminController {
    constructor() {
        this.getDashboardStats = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const totalSales = await prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: { paymentStatus: 'COMPLETED' }, // Assuming only paid orders count
            });
            const totalOrders = await prisma.order.count();
            const activeUsers = await prisma.user.count({ where: { isVerified: true } });
            // Low stock products
            const lowStockProducts = await prisma.product.count({
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
        });
    }
}
exports.AdminController = AdminController;
