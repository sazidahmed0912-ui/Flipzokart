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
exports.ProductService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../utils/AppError");
const prisma = new client_1.PrismaClient();
class ProductService {
    createProduct(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const slug = data.title.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
            return yield prisma.product.create({
                data: Object.assign(Object.assign({}, data), { slug }),
            });
        });
    }
    updateProduct(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.product.update({
                where: { id },
                data,
            });
        });
    }
    deleteProduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.product.delete({
                where: { id },
            });
        });
    }
    getProduct(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield prisma.product.findUnique({
                where: { slug },
                include: {
                    category: true,
                    reviews: true,
                },
            });
            if (!product)
                throw new AppError_1.AppError('Product not found', 404);
            return product;
        });
    }
    getAllProducts(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, limit = 10, search, category, minPrice, maxPrice, sort } = query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = Object.assign(Object.assign(Object.assign(Object.assign({ isActive: true }, (search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            })), (category && { category: { slug: category } })), (minPrice && { price: { gte: Number(minPrice) } })), (maxPrice && { price: { lte: Number(maxPrice) } }));
            const [products, total] = yield prisma.$transaction([
                prisma.product.findMany({
                    where,
                    take: Number(limit),
                    skip,
                    orderBy: sort ? { price: sort === 'price-asc' ? 'asc' : 'desc' } : { createdAt: 'desc' },
                    include: { category: true },
                }),
                prisma.product.count({ where }),
            ]);
            return { products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
        });
    }
}
exports.ProductService = ProductService;
