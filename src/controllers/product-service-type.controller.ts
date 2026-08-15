import ProductServiceTypeService from "../services/product-service-type.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

import * as T from "../types/product-service-type.types";

import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

export default class ProductServiceTypeController {
    public static createMany = catchAsync(async (req, res) => {
        const typeService = new ProductServiceTypeService(req.context);

        const validRequest = req as unknown as T.ValidCreateProductServiceTypes;
        const newProdServTypes = validRequest.body.data;

        for (const newType of newProdServTypes) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
                "create",
                fnSubject("TipoProdutoServico", { ...newType })
            );
        }

        const tProdServ = await typeService.createMany(newProdServTypes);
        res.status(httpStatus.CREATED).send(tProdServ);
    });

    public static findMany = catchAsync(async (req, res) => {
        const typeService = new ProductServiceTypeService(req.context);

        const validRequest = req as unknown as T.ValidFindProductserviceTypes;
        const params = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "read",
            fnSubject("TipoProdutoServico", { ...params })
        );

        const result = await typeService.findManyBy(validRequest.query);
        res.send(result);
    });

    public static getOne = catchAsync(async (req, res) => {
        const typeService = new ProductServiceTypeService(req.context);

        const validRequest = req as unknown as T.ValidGetProductServiceType;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "read",
            fnSubject("TipoProdutoServico", { ...params })
        );

        const productServiceType = await typeService.getOneBy(validRequest.params.id);
        if (!productServiceType) throw new ApiError(httpStatus.NOT_FOUND, "Tipo Produto Serviço não encontrada.");

        res.send(productServiceType);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const typeService = new ProductServiceTypeService(req.context);

        const validRequest = req as unknown as T.ValidUpdateProductServiceType;
        const params = { ...validRequest.params, ...validRequest.body.data };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "update",
            fnSubject("TipoProdutoServico", { ...params })
        );

        const editProdServTypeData = { id: validRequest.params.id, ...validRequest.body.data };

        const tProdServ = await typeService.updateOne(editProdServTypeData);
        res.send(tProdServ);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const typeService = new ProductServiceTypeService(req.context);

        const validRequest = req as unknown as T.ValidDeleteProductServiceType;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "delete",
            fnSubject("TipoProdutoServico", { ...params })
        );

        await typeService.deleteOneBy(validRequest.params.id);
        res.status(httpStatus.NO_CONTENT).send();
    });
}
