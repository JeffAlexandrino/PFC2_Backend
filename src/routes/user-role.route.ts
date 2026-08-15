import UserRoleController from "../controllers/user-role.controller";
import UserRoleValidator from "../validations/user-role.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

router.route("/").get(auth(), yupValidate(UserRoleValidator.findUserRoles), UserRoleController.findMany);
router.route(ApiRoutes.getIdRoute()).get(auth(), yupValidate(UserRoleValidator.getUserRole), UserRoleController.getOne);

export default router;
