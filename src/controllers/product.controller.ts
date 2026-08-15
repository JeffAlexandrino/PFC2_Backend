import ProductService from "../services/product.service";
import catchAsync from "../utils/catchAsync";
import httpStatus from "../utils/httpStatus";
import ApiError from "../utils/apiError";

import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import * as T from "../types/product.types";

export default class ProductController {
    public static createMany = catchAsync(async (req, res) => {
        const productService = new ProductService(req.context);

        const validRequest = req as unknown as T.ValidCreateProducts;
        const newProducts = validRequest.body.data;

        for (const newProduct of newProducts) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
                "create",
                fnSubject("Produto", { ...newProduct })
            );
        }

        const createdProducts = await productService.createMany(newProducts);
        res.status(httpStatus.CREATED).send(createdProducts);
    });

    public static findMany = catchAsync(async (req, res) => {
        const productService = new ProductService(req.context);

        const validRequest = req as unknown as T.ValidFindProducts;
        const params = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Produto", { ...params }));

        const result = await productService.findMany(validRequest.query);
        res.send(result);
    });

    public static getOne = catchAsync(async (req, res) => {
        const productService = new ProductService(req.context);

        const validRequest = req as unknown as T.ValidGetProduct;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Produto", { ...params }));

        const product = await productService.getOneBy(validRequest.params.id);
        if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Produto não encontrado.");

        res.send(product);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const productService = new ProductService(req.context);

        const validRequest = req as unknown as T.ValidUpdateProduct;
        const params = { ...validRequest.body.data, ...validRequest.params };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Produto", { ...params }));

        const editProductData = { id: params.id, ...validRequest.body.data };

        const updatedProduct = await productService.updateOne(editProductData);
        res.send(updatedProduct);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const productService = new ProductService(req.context);

        const validRequest = req as unknown as T.ValidDeleteProduct;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("delete", fnSubject("Produto", { ...params }));

        await productService.deleteOneBy(validRequest.params.id);
        res.status(httpStatus.NO_CONTENT).send();
    });
}
