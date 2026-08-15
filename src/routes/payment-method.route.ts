import PaymentMethodController from "../controllers/payment-method.controller";
import PaymentMethodValidator from "../validations/payment-method.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();
router
    .route("/")
    .post(auth(), yupValidate(PaymentMethodValidator.createPaymentMethods), PaymentMethodController.createMany)
    .get(auth(), yupValidate(PaymentMethodValidator.findPaymentMethods), PaymentMethodController.findMany);

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(PaymentMethodValidator.getPaymentMethod), PaymentMethodController.getOne)
    .patch(auth(), yupValidate(PaymentMethodValidator.updatePaymentMethod), PaymentMethodController.udpateOne)
    .delete(auth(), yupValidate(PaymentMethodValidator.deletePaymentMethod), PaymentMethodController.deleteOne);

export default router;
