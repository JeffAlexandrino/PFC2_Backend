import ServiceService from "../services/service.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import * as T from "../types/service.types";

export default class ServiceController {
    public static createMany = catchAsync(async (req, res) => {
        const serviceService = new ServiceService(req.context);

        const validRequest = req as unknown as T.ValidCreateServices;
        const newServices = validRequest.body.data;

        for (const newService of newServices) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
                "create",
                fnSubject("Servico", { ...newService })
            );
        }

        const createdServices = await serviceService.createMany(newServices);
        res.status(httpStatus.CREATED).send(createdServices);
    });

    public static findMany = catchAsync(async (req, res) => {
        const serviceService = new ServiceService(req.context);

        const validRequest = req as unknown as T.ValidFindServices;
        const where = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Servico", { ...where }));

        const results = await serviceService.findManyBy(validRequest.query);
        res.send(results);
    });

    public static getOne = catchAsync(async (req, res) => {
        const serviceService = new ServiceService(req.context);

        const validRequest = req as unknown as T.ValidGetService;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Servico", { ...params }));

        const service = await serviceService.getOneBy(params.id);
        if (!service) throw new ApiError(httpStatus.NOT_FOUND, "Servico não encontrado.");

        res.send(service);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const serviceService = new ServiceService(req.context);

        const validRequest = req as unknown as T.ValidUpdateService;
        const params = { ...validRequest.params, ...validRequest.body.data };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Servico", { ...params }));

        const serviceData = { id: params.id, ...validRequest.body.data };
        const service = await serviceService.updateOne(serviceData);

        res.send(service);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const serviceService = new ServiceService(req.context);

        const validRequest = req as unknown as T.ValidDeleteService;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("delete", fnSubject("Servico", { ...params }));

        await serviceService.deleteOneBy(validRequest.params.id);
        res.status(httpStatus.NO_CONTENT).send();
    });
}
