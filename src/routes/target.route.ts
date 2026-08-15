import TargetController from "../controllers/target.controller";
import TargetValidator from "../validations/target.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

router
    .route("/")
    .post(auth(), yupValidate(TargetValidator.createTarget), TargetController.createMany)
    .get(auth(), yupValidate(TargetValidator.findTargets), TargetController.findMany);

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(TargetValidator.getTarget), TargetController.getOne)
    .patch(auth(), yupValidate(TargetValidator.updateTarget), TargetController.updateOne)
    .delete(auth(), yupValidate(TargetValidator.deleteTarget), TargetController.deleteOne);

export default router;
