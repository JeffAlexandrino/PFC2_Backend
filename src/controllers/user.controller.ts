import {
    ValidGetOneUser,
    ValidDeleteUser,
    ValidUpdateUserRoles,
    ValidCreateUsers,
    ValidFindUsers,
    ValidUpdateUserInfo,
} from "../validations/user.validator";
import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import OrganizationService from "../services/organization.service";
import UserService from "../services/user.service";
import catchAsync from "../utils/catchAsync";
import httpStatus from "../utils/httpStatus";
import ApiError from "../utils/apiError";

export default class UserController {
    //Controller catches the data coming from the front and handles it
    public static createMany = catchAsync(async (req, res) => {
        const userService = new UserService(req.context);

        const validRequest = req as unknown as ValidCreateUsers;
        const newUsers = validRequest.body.data;

        for (const user of newUsers)
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan("create", fnSubject("User", { ...user }));

        const createdUsers = await userService.createMany(newUsers);
        res.status(httpStatus.CREATED).send(createdUsers);
    });

    public static getMyInfo = catchAsync(async (req, res) => {
        const organizationService = new OrganizationService(req.context);
        const userService = new UserService(req.context);

        const user = await userService.getInfoByContext();
        const currentOrganization = await organizationService.getOneByContext();
        if (!currentOrganization) throw new ApiError(httpStatus.NOT_FOUND, "Empresa não encontrada.");

        res.send({
            user,
            regrasHabilidades: req.context.userAbilities.rules,
            currentUserRole: {
                ...req.context.currentUserRole,
                empresa: {
                    ...currentOrganization,
                    empresaLogo: currentOrganization.empresaLogo
                        ? OrganizationService.getLogoInnfo(currentOrganization.empresaLogo)
                        : null,
                    empresaLogoSrc: currentOrganization.empresaLogo
                        ? OrganizationService.getLogoInnfo(currentOrganization.empresaLogo)
                        : null,
                },
            },
        });
    });

    public static findMany = catchAsync(async (req, res) => {
        const userService = new UserService(req.context);

        const validRequest = req as unknown as ValidFindUsers;
        const where = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("User", { ...where }));

        const users = await userService.findManyBy(validRequest.query);
        res.send(users);
    });

    public static getOneUser = catchAsync(async (req, res) => {
        const userService = new UserService(req.context);

        const validRequest = req as unknown as ValidGetOneUser;
        const params = { ...validRequest.params, ...validRequest.query };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("User", { ...params }));

        const user = await userService.getOneBy(params.id);
        res.send(user);
    });

    public static updateRoles = catchAsync(async (req, res) => {
        const userService = new UserService(req.context);

        const validRequest = req as unknown as ValidUpdateUserRoles;
        const params = { ...validRequest.params, ...validRequest.body.data, ...validRequest.query };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("User", { ...params }));

        const updatedUserRole = await userService.updateRoles(params.id, validRequest.body.data, validRequest.query);
        res.send(updatedUserRole);
    });

    public static updateInfo = catchAsync(async (req, res) => {
        const userService = new UserService(req.context);

        const validRequest = req as unknown as ValidUpdateUserInfo;
        const params = { ...validRequest.params, ...validRequest.body.data, ...validRequest.query };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("User", { ...params }));

        const updatedUser = await userService.updateInfo(params.id, validRequest.body.data, validRequest.query);
        res.send(updatedUser);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const userService = new UserService(req.context);

        const validRequest = req as unknown as ValidDeleteUser;
        const params = { ...validRequest.params, ...validRequest.query };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("delete", fnSubject("User", { ...params }));

        await userService.deleteOneBy(params.id, validRequest.query);
        res.status(httpStatus.NO_CONTENT).send();
    });
}
