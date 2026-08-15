import { ValidFindDashboardsWithMetric, ValidFindDashboardsWithoutMetric } from "../types/dashboards.types";
import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import DashboardService from "../services/dashboard.service";
import catchAsync from "../utils/catchAsync";

export default class DashboardController {
    public static getTotalValues = catchAsync(async (req, res) => {
        const dashboardService = new DashboardService(req.context);

        const validRequest = req as unknown as ValidFindDashboardsWithMetric;
        const params = validRequest.query;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Dashboard", { ...params }));

        const resultado = await dashboardService.getTotalValuesByMetric(validRequest.query);

        res.send(resultado);
    });

    public static getCustomerRank = catchAsync(async (req, res) => {
        const dashboardService = new DashboardService(req.context);

        const validRequest = req as unknown as ValidFindDashboardsWithMetric;
        const params = validRequest.query;
        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Dashboard", { ...params }));

        const resultado = await dashboardService.getCustomerRankByMetric(validRequest.query);
        res.send(resultado);
    });

    public static getSalePersonRank = catchAsync(async (req, res) => {
        const dashboardService = new DashboardService(req.context);

        const validRequest = req as unknown as ValidFindDashboardsWithMetric;
        const params = validRequest.query;
        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Dashboard", { ...params }));

        const resultado = await dashboardService.getUserRoleRankByMetric(validRequest.query);
        res.send(resultado);
    });

    public static getCategoryRank = catchAsync(async (req, res) => {
        const dashboardService = new DashboardService(req.context);

        const validRequest = req as unknown as ValidFindDashboardsWithMetric;
        const params = validRequest.query;
        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Dashboard", { ...params }));

        const resultado = await dashboardService.getCategoryRankByMetric(validRequest.query);
        res.send(resultado);
    });

    public static getEvolution = catchAsync(async (req, res) => {
        const dashboardService = new DashboardService(req.context);

        const validRequest = req as unknown as ValidFindDashboardsWithMetric;
        const params = validRequest.query;
        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Dashboard", { ...params }));

        const resultado = await dashboardService.getEvolutionByMetric(validRequest.query);
        res.send(resultado);
    });

    public static getProductServiceTypesValues = catchAsync(async (req, res) => {
        const dashboardService = new DashboardService(req.context);

        const validRequest = req as unknown as ValidFindDashboardsWithMetric;
        const params = validRequest.query;
        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Dashboard", { ...params }));

        const resultado = await dashboardService.getProductServiceTypesValuesByMetric(validRequest.query);
        res.send(resultado);
    });

    public static getAchievedTarget = catchAsync(async (req, res) => {
        const dashboardService = new DashboardService(req.context);

        const validRequest = req as unknown as ValidFindDashboardsWithMetric;
        const params = validRequest.query;
        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Dashboard", { ...params }));

        const resultado = await dashboardService.getAchievedTarget(validRequest.query);
        res.send(resultado);
    });

    public static getContributionMargin = catchAsync(async (req, res) => {
        const dashboardService = new DashboardService(req.context);

        const validRequest = req as unknown as ValidFindDashboardsWithoutMetric;
        const params = validRequest.query;
        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Dashboard", { ...params }));

        const resultado = await dashboardService.getContributionMargin(validRequest.query);
        res.send(resultado);
    });
}
