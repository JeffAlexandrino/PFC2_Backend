import CommissionController from "../controllers/commission.controller";
import CommissionValidator from "../validations/commission.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

router
    .route("/")
    .get(auth(), yupValidate(CommissionValidator.findMany), CommissionController.findMany)
    .patch(auth(), yupValidate(CommissionValidator.payMany), CommissionController.payMany);

router
    .route(ApiRoutes.getCommissionsApproveMany())
    .patch(auth(), yupValidate(CommissionValidator.approveMany), CommissionController.approveMany);

router
    .route(ApiRoutes.getCommissionsSupplierPaid())
    .patch(auth(), yupValidate(CommissionValidator.toggleDistributorPaid), CommissionController.toggleDistributorPaid);

router
    .route(ApiRoutes.getInfoRole())
    .get(auth(), yupValidate(CommissionValidator.getInfoPerUser), CommissionController.getInfoPerUser);

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(CommissionValidator.getOne), CommissionController.getOne)
    .patch(auth(), yupValidate(CommissionValidator.payOne), CommissionController.payOne);

router
    .route(ApiRoutes.getCommissionsDisable())
    .get(auth(), yupValidate(CommissionValidator.getOne), CommissionController.getOne)
    .patch(auth(), yupValidate(CommissionValidator.disableOne), CommissionController.disableOne);

export default router;
