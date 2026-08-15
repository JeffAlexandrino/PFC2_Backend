import EmailService from "../services/email.service";
import AuthService from "../services/auth.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

import { tokenService } from "../services";

import * as T from "../types/auth.types";

export default class AuthController {
    public static login = catchAsync(async (req, res) => {
        const validRequest = req as unknown as T.ValidLogin;
        const { email, password } = validRequest.body;

        const user = await AuthService.getUserBy(email, password);

        const roles = user.userRoles.map((userRole) => ({ ...userRole }));
        const firstRole = roles[0];

        if (!firstRole)
            throw new ApiError(httpStatus.UNAUTHORIZED, "Seu usuário não possui papéis ativos.");

        const tokens = await tokenService.generateAuthToken({ userId: user.id, currentRoleId: firstRole.id });

        res.send({ user, tokens });
    });

    public static logout = catchAsync(async (req, res) => {
        const validRequest = req as unknown as T.ValidLogout;

        await AuthService.invalidateTokens(validRequest.body);
        res.status(httpStatus.NO_CONTENT).send();
    });

    public static keepAliveSession = catchAsync(async (req, res) => {
        const validRequest = req as unknown as T.ValidRefreshToken;
        const refreshToken = await AuthService.getNewAuthTokens(validRequest.body.refreshToken);
        res.send({ refreshToken });
    });

    public static getResetPassToken = catchAsync(async (req, res) => {
        const validRequest = req as unknown as T.ValidGetResetPasswordToken;
        const { email, redirect } = validRequest.body;

        const resetPasswordToken = await tokenService.generateResetPasswordToken(email);
        await EmailService.sendResetPasswordEmail(email, resetPasswordToken, redirect);
        res.status(httpStatus.NO_CONTENT).send();
    });

    public static updatePassword = catchAsync(async (req, res) => {
        const validRequest = req as unknown as T.ValidResetPassword;

        await AuthService.updateUserPassword(req.context.user.id, validRequest.body.password);
        res.status(httpStatus.NO_CONTENT).send();
    });

    public static resetPassword = catchAsync(async (req, res) => {
        const validRequest = req as unknown as T.ValidResetPassword;

        const tokenData = await tokenService.verifyToken(validRequest.query.token, "RESET_PASSWORD");

        await AuthService.updateUserPassword(tokenData.userId, validRequest.body.password);
        res.status(httpStatus.NO_CONTENT).send();
    });

    public static updateRole = catchAsync(async (req, res) => {
        const validRequest = req as unknown as T.ValidUpdateSessionRole;
        const newCurrentUserRoleId = validRequest.body.data.userRoleId;

        const authService = new AuthService(req.context);
        const updatedUser = await authService.updateCurrentUserRole(newCurrentUserRoleId);

        res.send(updatedUser);
    });
}
