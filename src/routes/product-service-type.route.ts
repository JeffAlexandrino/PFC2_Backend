import ProductServiceTypeController from "../controllers/product-service-type.controller";
import ProductServiceTypeValidator from "../validations/product-service-type.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();
router
    .route("/")
    .post(auth(), yupValidate(ProductServiceTypeValidator.createMany), ProductServiceTypeController.createMany)
    .get(auth(), yupValidate(ProductServiceTypeValidator.findMany), ProductServiceTypeController.findMany);

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(ProductServiceTypeValidator.getOne), ProductServiceTypeController.getOne)
    .patch(auth(), yupValidate(ProductServiceTypeValidator.updateOne), ProductServiceTypeController.updateOne)
    .delete(auth(), yupValidate(ProductServiceTypeValidator.deleteOne), ProductServiceTypeController.deleteOne);

export default router;
