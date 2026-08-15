import {
    ValidDisableOneCommission,
    ValidGetOneCommission,
    ValidToggleCommissionsDistributorPaid,
    ValidPayManyCommissions,
    ValidPayOneCommission,
    ValidFindCommissions,
    ValidGetCommissionInfoPerUser,
    ValidApproveManyCommissions,
} from "../validations/commission.validator";
import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import CommissionService from "../services/commission.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

export default class CommissionController {
    public static findMany = catchAsync(async (req, res) => {
        const commissionService = new CommissionService(req.context);

        const validRequest = req as unknown as ValidFindCommissions;
        const where = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Comissao", { ...where }));

        const commissions = await commissionService.findManyBy(validRequest.query);
        res.send(commissions);
    });

    public static getOne = catchAsync(async (req, res) => {
        const commissionService = new CommissionService(req.context);

        const validRequest = req as unknown as ValidGetOneCommission;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Comissao", { ...params }));

        const comissao = await commissionService.getOne(validRequest.params.id);
        if (!comissao) throw new ApiError(httpStatus.NOT_FOUND, "Comissão não encontrada.");

        res.send(comissao);
    });

    public static disableOne = catchAsync(async (req, res) => {
        const commissionService = new CommissionService(req.context);

        const validRequest = req as unknown as ValidDisableOneCommission;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("delete", fnSubject("Comissao", { ...params }));

        const comissao = await commissionService.disableOne(params.id);
        if (!comissao) throw new ApiError(httpStatus.NOT_FOUND, "Comissão não encontrada.");

        res.send(comissao);
    });

    public static payOne = catchAsync(async (req, res) => {
        const commissionService = new CommissionService(req.context);

        const validRequest = req as unknown as ValidPayOneCommission;
        const params = { ...validRequest.params };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Comissao", { ...params }));

        const updatedCommission = await commissionService.payMany({ comissoesId: [params.id] });

        res.send(updatedCommission);
    });

    public static payMany = catchAsync(async (req, res) => {
        const commissionService = new CommissionService(req.context);

        const validRequest = req as unknown as ValidPayManyCommissions;
        const params = validRequest.body.data;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Comissao", { ...params }));

        await commissionService.payMany(params);

        res.status(httpStatus.NO_CONTENT).send();
    });

    public static toggleDistributorPaid = catchAsync(async (req, res) => {
        const commissionService = new CommissionService(req.context);

        const validRequest = req as unknown as ValidToggleCommissionsDistributorPaid;
        const params = validRequest.body.data;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Comissao", { ...params }));
        await commissionService.toggleDistributorPaid(params);

        res.status(httpStatus.NO_CONTENT).send();
    });

    public static approveMany = catchAsync(async (req, res) => {
        const commissionService = new CommissionService(req.context);

        const validRequest = req as unknown as ValidApproveManyCommissions;
        const params = validRequest.body.data;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Comissao", { ...params }));

        await commissionService.approveMany(params);

        res.status(httpStatus.NO_CONTENT).send();
    });

    public static getInfoPerUser = catchAsync(async (req, res) => {
        const commissionService = new CommissionService(req.context);

        const validRequest = req as unknown as ValidGetCommissionInfoPerUser;
        const params = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Comissao", { ...params }));

        const totalValues = await commissionService.getInfoPerRole(validRequest.query);
        res.send(totalValues);
    });
}
