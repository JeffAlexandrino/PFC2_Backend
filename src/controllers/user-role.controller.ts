import UserRoleService from "../services/user-role.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import * as T from "../types/user-role.types";

export default class UserRoleController {
    public static findMany = catchAsync(async (req, res) => {
        const userRoleService = new UserRoleService(req.context);

        const validRequest = req as unknown as T.ValidFindUserRoles;
        const where = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("UserRole", { ...where }));
        const result = await userRoleService.findManyBy(validRequest.query);

        res.status(httpStatus.OK).send(result);
    });

    public static getOne = catchAsync(async (req, res) => {
        const userRoleService = new UserRoleService(req.context);

        const validRequest = req as unknown as T.ValidGetUserRole;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("UserRole", { ...params }));

        const role = await userRoleService.getOneBy(params.id);
        if (!role) throw new ApiError(httpStatus.NOT_FOUND, "Papel não encontrado.");

        res.send(role);
    });
}
