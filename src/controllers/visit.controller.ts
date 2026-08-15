import {
    ValidGetVisit,
    ValidUpdateVisit,
    ValidUpdateVisitStatusPaid,
    ValidCreateVisit,
    ValidDeleteVisit,
    ValidFindVisits,
    ValidFindVisitsTotalExpensesPerRole,
} from "../validations/visit.validator";
import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import VisitService from "../services/visit.service";
import catchAsync from "../utils/catchAsync";
import httpStatus from "../utils/httpStatus";
import ApiError from "../utils/apiError";

export default class VisitController {
    public static createMany = catchAsync(async (req, res) => {
        const visitService = new VisitService(req.context);

        const validRequest = req as unknown as ValidCreateVisit;
        const newVisits = validRequest.body.data;

        for (const visit of newVisits)
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan("create", fnSubject("Visita", { ...visit }));

        const { data: visits } = validRequest.body;

        const createdVisits = await visitService.createMany(visits as any);

        res.status(httpStatus.CREATED).send(createdVisits);
    });

    public static findMany = catchAsync(async (req, res) => {
        const visitService = new VisitService(req.context);

        const validRequest = req as unknown as ValidFindVisits;
        const where = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Visita", { ...where }));

        const result = await visitService.findManyBy(validRequest.query);
        res.send(result);
    });

    public static getOne = catchAsync(async (req, res) => {
        const visitService = new VisitService(req.context);

        const validRequest = req as unknown as ValidGetVisit;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Visita", { ...params }));

        const visit = await visitService.getOneBy(validRequest.params.id);
        if (!visit) throw new ApiError(httpStatus.NOT_FOUND, "Visita não encontrada.");

        res.send(visit);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const visitService = new VisitService(req.context);

        const validRequest = req as unknown as ValidUpdateVisit;
        const params = { ...validRequest.body.data, ...validRequest.params, ...validRequest.query };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Visita", { ...params }));

        const updatedVisit = await visitService.updateOne(params.id, validRequest.body.data, validRequest.query);
        res.send(updatedVisit);
    });

    public static payMany = catchAsync(async (req, res) => {
        const visitService = new VisitService(req.context);

        const validRequest = req as unknown as ValidUpdateVisitStatusPaid;
        const params = validRequest.body.data;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Visita", { ...params }));

        await visitService.payMany(validRequest.body.data);

        res.status(httpStatus.OK).send();
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const visitService = new VisitService(req.context);

        const validRequest = req as unknown as ValidDeleteVisit;
        const params = { ...validRequest.params, ...validRequest.query };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("delete", fnSubject("Visita", { ...params }));

        await visitService.deleteOneBy(params.id, validRequest.query);

        res.status(httpStatus.NO_CONTENT).send();
    });

    public static getInfoExpensesPerRole = catchAsync(async (req, res) => {
        const visitService = new VisitService(req.context);

        const validRequest = req as unknown as ValidFindVisitsTotalExpensesPerRole;
        const params = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Visita", { ...params }));

        const infoExpensesPerRole = await visitService.getInfoExpensesPerRole(validRequest.query);
        res.send(infoExpensesPerRole);
    });
}
