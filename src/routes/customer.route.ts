import CustomerController from "../controllers/customer.controller";
import CustomerValidator from "../validations/customer.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

router
    .route("/")
    .post(auth(), yupValidate(CustomerValidator.createCustomers), CustomerController.createMany)
    .get(auth(), yupValidate(CustomerValidator.findCustomers), CustomerController.findMany);

router.post(
    ApiRoutes.importCustomers(),
    auth(),
    yupValidate(CustomerValidator.importCustomers),
    CustomerController.importMany
);

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(CustomerValidator.getCustomer), CustomerController.getOne)
    .patch(auth(), yupValidate(CustomerValidator.updateCustomer), CustomerController.updateOne)
    .delete(auth(), yupValidate(CustomerValidator.deleteCustomer), CustomerController.deleteOne);

export default router;
