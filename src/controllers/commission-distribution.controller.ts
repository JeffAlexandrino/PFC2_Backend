import CommissionDistributionService from "../services/commission-distribution.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

import * as T from "../types/commission-distribution.types";

import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

export default class CommissionDistributionController {
    public static createMany = catchAsync(async (req, res) => {
        const distributionService = new CommissionDistributionService(req.context);

        const validRequest = req as unknown as T.ValidCreateCommissionDistribution;
        const newDistributions = validRequest.body.data;

        for (const newDistribution of newDistributions) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
                "create",
                fnSubject("DistribuicaoComissao", { ...newDistribution })
            );
        }

        const createdCommissionDistributions = await distributionService.createMany(newDistributions);

        res.status(httpStatus.CREATED).send(createdCommissionDistributions);
    });

    public static findMany = catchAsync(async (req, res) => {
        const distributionService = new CommissionDistributionService(req.context);

        const validRequest = req as unknown as T.ValidFindCommissionDistribution;
        const where = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "read",
            fnSubject("DistribuicaoComissao", { ...where })
        );

        const result = await distributionService.findManyBy(validRequest.query);
        res.send(result);
    });

    public static getOne = catchAsync(async (req, res) => {
        const distributionService = new CommissionDistributionService(req.context);

        const validRequest = req as unknown as T.ValidGetCommissionDistribution;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "read",
            fnSubject("DistribuicaoComissao", { ...params })
        );

        const commissionDistribution = await distributionService.getOneBy(validRequest.params.id);
        if (!commissionDistribution)
            throw new ApiError(httpStatus.NOT_FOUND, "Distribuição de comissão não encontrada.");

        res.send(commissionDistribution);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const distributionService = new CommissionDistributionService(req.context);

        const validRequest = req as unknown as T.ValidUpdateCommissionDistribution;
        const params = { ...validRequest.params, ...validRequest.body.data };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "update",
            fnSubject("DistribuicaoComissao", { ...params })
        );

        const updateDistributionProps = { id: params.id, ...validRequest.body.data };
        const updatedDistribution = await distributionService.updateOne(updateDistributionProps);

        res.send(updatedDistribution);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const distributionService = new CommissionDistributionService(req.context);

        const validRequest = req as unknown as T.ValidDeleteCommissionDistribution;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "delete",
            fnSubject("DistribuicaoComissao", { ...params })
        );

        await distributionService.deleteOneBy(params.id);

        res.status(httpStatus.NO_CONTENT).send();
    });
}
