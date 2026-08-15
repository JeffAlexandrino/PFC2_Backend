import ManufacturerService from "../services/manufacterer.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

import * as T from "../types/manufacturer.types";

import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

export default class ManufacturerController {
    public static createMany = catchAsync(async (req, res) => {
        const manufacturerService = new ManufacturerService(req.context);

        const validRequest = req as unknown as T.ValidCreateManufacturers;
        const newManufacturers = validRequest.body.data;

        for (const params of newManufacturers) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
                "create",
                fnSubject("Fabricante", { ...params })
            );
        }
        const { data: newManufacterers } = validRequest.body;

        const createdManufacterers = await manufacturerService.createMany(newManufacterers);
        res.status(httpStatus.CREATED).send(createdManufacterers);
    });

    public static findMany = catchAsync(async (req, res) => {
        const manufacturerService = new ManufacturerService(req.context);

        const validRequest = req as unknown as T.ValidFindManufacturers;
        const params = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Fabricante", { ...params }));

        const result = await manufacturerService.findManyBy(validRequest.query);
        res.send(result);
    });

    public static getOne = catchAsync(async (req, res) => {
        const manufacturerService = new ManufacturerService(req.context);

        const validRequest = req as unknown as T.ValidGetManufacturer;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Fabricante", { ...params }));

        const manufacturer = await manufacturerService.getOneBy(validRequest.params.id);
        if (!manufacturer) throw new ApiError(httpStatus.NOT_FOUND, "Fabricante não encontrado.");

        res.send(manufacturer);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const manufacturerService = new ManufacturerService(req.context);

        const validRequest = req as unknown as T.ValidUpdateManufacturer;
        const params = validRequest.body.data;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Fabricante", { ...params }));

        const manufactererData = { id: validRequest.params.id, ...validRequest.body.data };

        const manufacterer = await manufacturerService.updateOne(manufactererData);
        res.send(manufacterer);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const manufacturerService = new ManufacturerService(req.context);

        const validRequest = req as unknown as T.ValidDeleteManufacturer;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("delete", fnSubject("Fabricante", { ...params }));

        await manufacturerService.deleteOneBy(validRequest.params.id);
        res.status(httpStatus.NO_CONTENT).send();
    });
}
