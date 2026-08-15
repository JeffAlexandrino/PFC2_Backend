import ServiceController from "../controllers/service.controller";
import ServiceValidator from "../validations/service.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

router
    .route("/")
    .post(auth(), yupValidate(ServiceValidator.createServices), ServiceController.createMany)
    .get(auth(), yupValidate(ServiceValidator.findServices), ServiceController.findMany);

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(ServiceValidator.getService), ServiceController.getOne)
    .patch(auth(), yupValidate(ServiceValidator.updateService), ServiceController.updateOne)
    .delete(auth(), yupValidate(ServiceValidator.deleteService), ServiceController.deleteOne);

export default router;
