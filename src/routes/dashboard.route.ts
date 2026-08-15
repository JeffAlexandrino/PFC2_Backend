import DashboardController from "../controllers/dashboard.controller";
import DashboardValidator from "../validations/dashboard.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();
router
    .route(ApiRoutes.getDashTotalValues())
    .get(auth(), yupValidate(DashboardValidator.getTotalValues), DashboardController.getTotalValues);

router
    .route(ApiRoutes.getDashTarget())
    .get(auth(), yupValidate(DashboardValidator.getAchievedTarget), DashboardController.getAchievedTarget);

router
    .route(ApiRoutes.getDashRankCustomers())
    .get(auth(), yupValidate(DashboardValidator.getCustomerRank), DashboardController.getCustomerRank);

router
    .route(ApiRoutes.getDashRankSalePerson())
    .get(auth(), yupValidate(DashboardValidator.getSalePersonRank), DashboardController.getSalePersonRank);

router
    .route(ApiRoutes.getDashRankCategory())
    .get(auth(), yupValidate(DashboardValidator.getCategoryRank), DashboardController.getCategoryRank);

router
    .route(ApiRoutes.getDashEvolutions())
    .get(auth(), yupValidate(DashboardValidator.getEvolution), DashboardController.getEvolution);

router
    .route(ApiRoutes.getDashProductServiceType())
    .get(
        auth(),
        yupValidate(DashboardValidator.getProductServiceTypesValues),
        DashboardController.getProductServiceTypesValues
    );

router
    .route(ApiRoutes.getDashMarginContribution())
    .get(auth(), yupValidate(DashboardValidator.getContributionMargin), DashboardController.getContributionMargin);

export default router;
