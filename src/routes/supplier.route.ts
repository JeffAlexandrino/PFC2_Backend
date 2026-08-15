import SupplierController from "../controllers/supplier.controller";
import SupplierValidator from "../validations/supplier.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

router
    .route("/")
    .post(auth(), yupValidate(SupplierValidator.createSuppliers), SupplierController.createMany)
    .get(auth(), yupValidate(SupplierValidator.findSuppliers), SupplierController.findMany);

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(SupplierValidator.getSupplier), SupplierController.getOne)
    .patch(auth(), yupValidate(SupplierValidator.updateSupplier), SupplierController.updateOne)
    .delete(auth(), yupValidate(SupplierValidator.deleteSupplier), SupplierController.deleteOne);

export default router;
