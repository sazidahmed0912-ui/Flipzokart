"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("../services/product.service");
const catchAsync_1 = require("../utils/catchAsync");
const productService = new product_service_1.ProductService();
class ProductController {
    constructor() {
        this.createProduct = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const product = await productService.createProduct(req.body);
            res.status(201).json({
                status: 'success',
                data: { product },
            });
        });
        this.updateProduct = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const product = await productService.updateProduct(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                data: { product },
            });
        });
        this.deleteProduct = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            await productService.deleteProduct(req.params.id);
            res.status(204).json({
                status: 'success',
                data: null,
            });
        });
        this.getProduct = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const product = await productService.getProduct(req.params.slug);
            res.status(200).json({
                status: 'success',
                data: { product },
            });
        });
        this.getAllProducts = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const result = await productService.getAllProducts(req.query);
            res.status(200).json({
                status: 'success',
                ...result,
            });
        });
    }
}
exports.ProductController = ProductController;
