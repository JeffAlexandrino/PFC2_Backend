import ManufacturerController from "../controllers/manufacturer.controller";
import ManufacturerValidator from "../validations/manufacturer.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

router
    .route("/")
    .post(auth(), yupValidate(ManufacturerValidator.createManufacterers), ManufacturerController.createMany)
    .get(auth(), yupValidate(ManufacturerValidator.findManufacterer), ManufacturerController.findMany);
router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(ManufacturerValidator.getManufacterer), ManufacturerController.getOne)
    .patch(auth(), yupValidate(ManufacturerValidator.updateManufacterer), ManufacturerController.updateOne)
    .delete(auth(), yupValidate(ManufacturerValidator.deleteManufacterer), ManufacturerController.deleteOne);

export default router;
