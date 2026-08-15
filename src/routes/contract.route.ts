import ContractController from "../controllers/contract.controller";
import ContractValidator from "../validations/contract.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

router
    .route("/")
    .post(auth(), yupValidate(ContractValidator.createMany), ContractController.createMany)
    .get(auth(), yupValidate(ContractValidator.findMany), ContractController.findMany);

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(ContractValidator.getOne), ContractController.getOne)
    .patch(auth(), yupValidate(ContractValidator.updateOne), ContractController.updateOne)
    .delete(auth(), yupValidate(ContractValidator.deleteOne), ContractController.deleteOne);

export default router;
