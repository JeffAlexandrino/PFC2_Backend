import OrganizationController from "../controllers/organization.controller";
import OrganizationValidator from "../validations/organization.validator";
import upload from "../middlewares/multer";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();
router.route("/").get(auth(), yupValidate(OrganizationValidator.findMany), OrganizationController.findMany);

router
    .route(ApiRoutes.getIdRoute())
    .patch(
        auth(),
        upload.single("data[logo]"),
        yupValidate(OrganizationValidator.updateOne),
        OrganizationController.updateOne
    );

export default router;
