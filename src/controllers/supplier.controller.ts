import SupplierService from "../services/supplier.service";
import catchAsync from "../utils/catchAsync";
import httpStatus from "../utils/httpStatus";
import ApiError from "../utils/apiError";

import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import * as T from "../types/supplier.types";

export default class SupplierController {
    public static createMany = catchAsync(async (req, res) => {
        const supplierService = new SupplierService(req.context);

        const validRequest = req as unknown as T.ValidCreateSuppliers;
        const newSuppliers = validRequest.body.data;

        for (const newSupplier of newSuppliers) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
                "create",
                fnSubject("Fornecedor", { ...newSupplier })
            );
        }

        const createdSuppliers = await supplierService.createMany(newSuppliers);
        res.status(httpStatus.CREATED).send(createdSuppliers);
    });

    public static findMany = catchAsync(async (req, res) => {
        const supplierService = new SupplierService(req.context);

        const validRequest = req as unknown as T.ValidFindSuppliers;
        const where = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Fornecedor", { ...where }));

        const result = await supplierService.findManyBy(validRequest.query);
        res.send(result);
    });

    public static getOne = catchAsync(async (req, res) => {
        const supplierService = new SupplierService(req.context);

        const validRequest = req as unknown as T.ValidGetSupplier;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Fornecedor", { ...params }));

        const supplier = await supplierService.getOneBy(params.id);

        if (!supplier) throw new ApiError(httpStatus.NOT_FOUND, "Fornecedor não encontrado.");
        res.send(supplier);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const supplierService = new SupplierService(req.context);

        const validRequest = req as unknown as T.ValidUpdateSupplier;
        const params = { ...validRequest.body.data, ...validRequest.params };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Fornecedor", { ...params }));

        const supplierData = { id: params.id, ...validRequest.body.data };
        const supplier = await supplierService.updateOne(supplierData);

        res.send(supplier);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const supplierService = new SupplierService(req.context);

        const validRequest = req as unknown as T.ValidDeleteSupplier;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("delete", fnSubject("Fornecedor", { ...params }));

        await supplierService.deleteOneBy(validRequest.params.id);
        res.status(httpStatus.NO_CONTENT).send();
    });
}
