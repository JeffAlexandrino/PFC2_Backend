import CommissionDistributionController from "../controllers/commission-distribution.controller";
import CommissionDistributionValidator from "../validations/commission-distribution.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

router
    .route("/")
    .post(auth(), yupValidate(CommissionDistributionValidator.createMany), CommissionDistributionController.createMany)
    .get(auth(), yupValidate(CommissionDistributionValidator.findMany), CommissionDistributionController.findMany);

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(CommissionDistributionValidator.getOne), CommissionDistributionController.getOne)
    .patch(auth(), yupValidate(CommissionDistributionValidator.updateOne), CommissionDistributionController.updateOne)
    .delete(auth(), yupValidate(CommissionDistributionValidator.deleteOne), CommissionDistributionController.deleteOne);

export default router;
