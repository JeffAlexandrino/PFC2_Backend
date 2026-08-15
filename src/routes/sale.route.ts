import SaleController from "../controllers/sale.controller";
import SaleValidator from "../validations/sale.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

router
    .route("/")
    .post(auth(), yupValidate(SaleValidator.createSale), SaleController.createMany)
    .get(auth(), yupValidate(SaleValidator.findSales), SaleController.findMany);

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(SaleValidator.getSale), SaleController.getOne)
    .patch(auth(), yupValidate(SaleValidator.updateSale), SaleController.updateOne)
    .delete(auth(), yupValidate(SaleValidator.deleteSale), SaleController.deleteOne);

export default router;
