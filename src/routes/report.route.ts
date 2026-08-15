import ReportValidator, {
    ValidFindCommissionReports,
    ValidFindSalesReports,
    ValidFindUserReports,
    ValidFindVisitReports,
} from "../validations/report.validator";
import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";
import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import ReportController from "../controllers/report.controller";
import auth from "../middlewares/auth";
import express from "express";

const router = express.Router();

router
    .route(ApiRoutes.getCommissions())
    .post(auth(), yupValidate(ReportValidator.findCommissionReports), (req, res, next) => {
        try {
            const validRequest = req as unknown as ValidFindCommissionReports;
            const params = validRequest.query.where;

            ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Comissao", { ...params }));
            ReportController.findManyCommissionReports(req, res, next);
        } catch (error) {
            next(error);
        }
    });

router
    .route(ApiRoutes.getReportSalesClient())
    .post(auth(), yupValidate(ReportValidator.findSalesReports), (req, res, next) => {
        try {
            const validRequest = req as unknown as ValidFindSalesReports;
            const params = validRequest.query.where;

            ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Venda", { ...params }));
            ReportController.clientSaleReports(req, res, next);
        } catch (error) {
            next(error);
        }
    });

router
    .route(ApiRoutes.getReportSalesUser())
    .post(auth(), yupValidate(ReportValidator.findSalesReports), (req, res, next) => {
        try {
            const validRequest = req as unknown as ValidFindSalesReports;
            const params = validRequest.query.where;

            ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Venda", { ...params }));
            ReportController.userSaleReports(req, res, next);
        } catch (error) {
            next(error);
        }
    });

router.route(ApiRoutes.getVisits()).post(auth(), yupValidate(ReportValidator.findVisitReports), (req, res, next) => {
    try {
        const validRequest = req as unknown as ValidFindVisitReports;
        const params = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Visita", { ...params }));
        ReportController.findManyVisitsReports(req, res, next);
    } catch (error) {
        next(error);
    }
});

router
    .route(ApiRoutes.getReportsUsers())
    .post(auth(), yupValidate(ReportValidator.findUserReports), (req, res, next) => {
        try {
            const validRequest = req as unknown as ValidFindUserReports;
            const params = validRequest.query.where;

            ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("User", { ...params }));
            ReportController.userRolesSalesReports(req, res, next);
        } catch (error) {
            next(error);
        }
    });

export default router;
