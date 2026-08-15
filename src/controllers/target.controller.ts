import {
    ValidCreateTargets,
    ValidFindTargets,
    ValidGetTarget,
    ValidUpdateTarget,
    ValidDeleteTarget,
} from "../validations/target.validator";
import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import TargetService from "../services/target.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

export default class TargetController {
    public static createMany = catchAsync(async (req, res) => {
        const targetService = new TargetService(req.context);

        const validRequest = req as unknown as ValidCreateTargets;
        const newTargets = validRequest.body.data;

        for (const newTarget of newTargets) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
                "create",
                fnSubject("Meta", { ...newTarget, ...validRequest.query })
            );
        }

        const createdTargets = await targetService.createMany(newTargets, validRequest.query);
        res.status(httpStatus.CREATED).send(createdTargets);
    });

    public static findMany = catchAsync(async (req, res) => {
        const targetService = new TargetService(req.context);

        const validRequest = req as unknown as ValidFindTargets;
        const where = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Meta", { ...where }));

        const targets = await targetService.findManyBy(validRequest.query);
        res.send(targets);
    });

    public static getOne = catchAsync(async (req, res) => {
        const targetService = new TargetService(req.context);

        const validRequest = req as unknown as ValidGetTarget;
        const params = { ...validRequest.params, ...validRequest.query };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Meta", { ...params }));

        const target = await targetService.getOneBy(params.id, validRequest.query);
        if (!target) throw new ApiError(httpStatus.NOT_FOUND, "Meta não encontrada.");

        res.send(target);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const targetService = new TargetService(req.context);

        const validRequest = req as unknown as ValidUpdateTarget;
        const params = { ...validRequest.params, ...validRequest.body.data, ...validRequest.query };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Meta", { ...params }));

        const target = await targetService.updateOne(params.id, validRequest.body.data, validRequest.query);
        res.send(target);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const targetService = new TargetService(req.context);

        const validRequest = req as unknown as ValidDeleteTarget;
        const params = { ...validRequest.params, ...validRequest.query };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("delete", fnSubject("Meta", { ...params }));

        await targetService.deleteOneBy(validRequest.params.id, validRequest.query);
        res.status(httpStatus.NO_CONTENT).send();
    });
}
