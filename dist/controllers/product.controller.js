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
exports.ProductController = void 0;
const product_service_1 = require("../services/product.service");
const catchAsync_1 = require("../utils/catchAsync");
const productService = new product_service_1.ProductService();
class ProductController {
    constructor() {
        this.createProduct = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const product = yield productService.createProduct(req.body);
            res.status(201).json({
                status: 'success',
                data: { product },
            });
        }));
        this.updateProduct = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const product = yield productService.updateProduct(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                data: { product },
            });
        }));
        this.deleteProduct = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            yield productService.deleteProduct(req.params.id);
            res.status(204).json({
                status: 'success',
                data: null,
            });
        }));
        this.getProduct = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const product = yield productService.getProduct(req.params.slug);
            res.status(200).json({
                status: 'success',
                data: { product },
            });
        }));
        this.getAllProducts = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const result = yield productService.getAllProducts(req.query);
            res.status(200).json(Object.assign({ status: 'success' }, result));
        }));
    }
}
exports.ProductController = ProductController;
