import OrganizationTargetController from "../controllers/organization-target.controller";
import OrganizationTargetValidator from "../validations/organization-target.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../api-routes";

const router = express.Router();

router
    .route("/")
    .post(auth(), yupValidate(OrganizationTargetValidator.createOrganizationTarget), OrganizationTargetController.createMany)
    .get(auth(), yupValidate(OrganizationTargetValidator.findOrganizationTargets), OrganizationTargetController.findMany);

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(OrganizationTargetValidator.getOrganizationTargets), OrganizationTargetController.getOne)
    .patch(auth(), yupValidate(OrganizationTargetValidator.updateOrganizationTarget), OrganizationTargetController.updateOne)
    .delete(auth(), yupValidate(OrganizationTargetValidator.deleteOrganizationTarget), OrganizationTargetController.deleteOne);

export default router;
