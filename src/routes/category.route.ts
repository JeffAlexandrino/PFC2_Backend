import CategoryController from "../controllers/category.controller";
import CategoryValidator from "../validations/category.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

router
    .route("/")
    .post(auth(), yupValidate(CategoryValidator.createCategories), CategoryController.createMany)
    .get(auth(), yupValidate(CategoryValidator.findCategories), CategoryController.findMany);

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(CategoryValidator.getCategory), CategoryController.getOne)
    .patch(auth(), yupValidate(CategoryValidator.updateCategory), CategoryController.updateOne)
    .delete(auth(), yupValidate(CategoryValidator.deleteCategory), CategoryController.deleteOne);

export default router;
