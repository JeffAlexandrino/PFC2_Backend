import {
    ValidCreateSale,
    ValidDeleteSale,
    ValidFindSales,
    ValidGetSale,
    ValidUpdateSale,
} from "../validations/sale.validator";
import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import SaleService from "../services/sale.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

export default class SaleController {
    public static createMany = catchAsync(async (req, res) => {
        const saleService = new SaleService(req.context);

        const validRequest = req as unknown as ValidCreateSale;
        const newSales = validRequest.body.data;

        for (const sale of newSales) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan("create", fnSubject("Venda", { ...sale }));
        }
        const createdSales = await saleService.createMany(newSales);

        res.status(httpStatus.CREATED).send(createdSales);
    });

    public static findMany = catchAsync(async (req, res) => {
        const saleService = new SaleService(req.context);

        const validRequest = req as unknown as ValidFindSales;
        const where = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Venda", { ...where }));

        const sales = await saleService.findManyBy(validRequest.query);
        res.status(httpStatus.OK).send(sales);
    });

    public static getOne = catchAsync(async (req, res) => {
        const saleService = new SaleService(req.context);

        const validRequest = req as unknown as ValidGetSale;
        const params = { ...validRequest.params, ...validRequest.query };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Venda", { ...params }));

        const sale = await saleService.getOneBy(params.id);
        if (!sale) throw new ApiError(httpStatus.NOT_FOUND, "Venda não encontrada.");

        res.status(httpStatus.OK).send(sale);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const saleService = new SaleService(req.context);

        const validRequest = req as unknown as ValidUpdateSale;
        const params = { ...validRequest.params, ...validRequest.body.data, ...validRequest.query };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Venda", { ...params }));

        const sale = await saleService.updateOne(
            params.id,
            validRequest.body.data,
            validRequest.query,
            validRequest.body.reasonRegressionStatus
        );
        res.send(sale);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const saleService = new SaleService(req.context);

        const validRequest = req as unknown as ValidDeleteSale;
        const { params, query } = validRequest;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "delete",
            fnSubject("Venda", { ...params, ...query })
        );

        await saleService.deleteOneBy(validRequest.params.id, validRequest.query);
        res.status(httpStatus.NO_CONTENT).send();
    });
}
