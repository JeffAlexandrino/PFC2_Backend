import AuthController from "../controllers/auth.controller";
import AuthValidator from "../validations/auth.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

router.post(ApiRoutes.getResetPassword(), yupValidate(AuthValidator.updatePassword), AuthController.resetPassword);
router.post(
    ApiRoutes.getResetPasswordToken(),
    yupValidate(AuthValidator.getResetPassToken),
    AuthController.getResetPassToken
);

//TODO: Não é necessário passar o token no body, ele já vem no header.
router.post(ApiRoutes.getSessionKeepAlive(), yupValidate(AuthValidator.refreshTokens), AuthController.keepAliveSession);
router.post(ApiRoutes.getLogout(), yupValidate(AuthValidator.logout), AuthController.logout);
router.post(ApiRoutes.getLogin(), yupValidate(AuthValidator.login), AuthController.login);

router.patch(
    ApiRoutes.getUpdatePassword(),
    auth(),
    yupValidate(AuthValidator.updatePassword),
    AuthController.updatePassword
);
router.patch(
    ApiRoutes.getSessionRole(),
    auth(),
    yupValidate(AuthValidator.updateSessionRole),
    AuthController.updateRole
);

export default router;
