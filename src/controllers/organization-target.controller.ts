import {
    ValidCreateOrganizationTargets,
    ValidFindOrganizationTargets,
    ValidGetOrganizationTarget,
    ValidUpdateOrganizationTarget,
    ValidDeleteOrganizationTarget,
} from "../validations/organization-target.validator";
import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import OrganizationTargetService from "../services/organization-target.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

export default class OrganizationTargetController {
    public static createMany = catchAsync(async (req, res) => {
        const targetService = new OrganizationTargetService(req.context);

        const validRequest = req as unknown as ValidCreateOrganizationTargets;
        const newTargets = validRequest.body.data;

        for (const newTarget of newTargets) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
                "create",
                fnSubject("MetaEmpresa", { ...newTarget })
            );
        }

        const createdTargets = await targetService.createMany(newTargets);
        res.status(httpStatus.CREATED).send(createdTargets);
    });

    public static findMany = catchAsync(async (req, res) => {
        const targetService = new OrganizationTargetService(req.context);

        const validRequest = req as unknown as ValidFindOrganizationTargets;
        const where = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("MetaEmpresa", { ...where }));

        const targets = await targetService.findManyBy(validRequest.query);
        res.send(targets);
    });

    public static getOne = catchAsync(async (req, res) => {
        const targetService = new OrganizationTargetService(req.context);

        const validRequest = req as unknown as ValidGetOrganizationTarget;
        const params = { ...validRequest.params };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("MetaEmpresa", { ...params }));
        const target = await targetService.getOneBy(params.id);
        if (!target) throw new ApiError(httpStatus.NOT_FOUND, "Meta da empresa não encontrada.");

        res.send(target);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const targetService = new OrganizationTargetService(req.context);

        const validRequest = req as unknown as ValidUpdateOrganizationTarget;
        const params = { ...validRequest.params, ...validRequest.body.data };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "update",
            fnSubject("MetaEmpresa", { ...params })
        );

        const target = await targetService.updateOne(params.id, validRequest.body.data);
        res.send(target);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const targetService = new OrganizationTargetService(req.context);

        const validRequest = req as unknown as ValidDeleteOrganizationTarget;
        const params = { ...validRequest.params };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "delete",
            fnSubject("MetaEmpresa", { ...params })
        );

        //await targetService.deleteOneBy(validRequest.params.id);
        res.status(httpStatus.NO_CONTENT).send();
    });
}
