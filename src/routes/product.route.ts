import ProductController from "../controllers/product.controller";
import ProductValidator from "../validations/product.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

router
    .route("/")
    .post(auth(), yupValidate(ProductValidator.createProducts), ProductController.createMany)
    .get(auth(), yupValidate(ProductValidator.findProducts), ProductController.findMany);

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(ProductValidator.getProduct), ProductController.getOne)
    .patch(auth(), yupValidate(ProductValidator.updateProduct), ProductController.updateOne)
    .delete(auth(), yupValidate(ProductValidator.deleteProduct), ProductController.deleteOne);

export default router;
