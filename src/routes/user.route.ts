import UserController from "../controllers/user.controller";
import UserValidator from "../validations/user.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();
router
    .route("/")
    .post(auth(), yupValidate(UserValidator.createUsers), UserController.createMany)
    .get(auth(), yupValidate(UserValidator.findUsers), UserController.findMany);

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(UserValidator.getOneUser), UserController.getOneUser)
    .patch(auth(), yupValidate(UserValidator.updateUserInfo), UserController.updateInfo)
    .delete(auth(), yupValidate(UserValidator.deleteUser), UserController.deleteOne);

router
    .route(ApiRoutes.getEditRoleUser())
    .patch(auth(), yupValidate(UserValidator.updateUserRoles), UserController.updateRoles);

router.route(ApiRoutes.getMyUserInfo()).get(auth(), UserController.getMyInfo);

export default router;
