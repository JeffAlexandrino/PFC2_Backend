import { encryptPassword, isPasswordMatch } from "../utils/encryption";
import { AuthTokensResponse } from "../types/response";
import { RequestContext } from "../middlewares/auth";
import { TokenType } from "@prisma/client";

import httpStatus from "../utils/httpStatus";
import tokenService from "./token.service";
import ApiError from "../utils/apiError";
import UserService from "./user.service";
import exclude from "../utils/exclude";
import prisma from "../prisma/prisma";

export default class AuthService {
    private context: RequestContext;

    private static readonly INVALID_CREDENTIALS = "Credenciais inválidas!";

    constructor(context: RequestContext) {
        this.context = context;
    }

    public static getUserBy = async (email: string, password: string) => {
        //This function is for login purpose only, if you need for another reasen create another
        const user = await UserService.getOneByEmail(email);
        if (!user) throw new ApiError(httpStatus.UNAUTHORIZED, this.INVALID_CREDENTIALS);
        if (user.bloqueado === true) throw new ApiError(httpStatus.UNAUTHORIZED, this.INVALID_CREDENTIALS);

        const passwordMatched = await isPasswordMatch(password, user.password);
        if (!passwordMatched) throw new ApiError(httpStatus.UNAUTHORIZED, this.INVALID_CREDENTIALS);

        return exclude(user, ["password"]); //TODO: Remover a senha do retorno por default no prisma.
    };

    public static getNewAuthTokens = async (refreshToken: string): Promise<AuthTokensResponse> => {
        const refreshTokenData = await tokenService.verifyToken(refreshToken, TokenType.REFRESH);
        const { userId, currentUserRoleId } = refreshTokenData;

        if (!currentUserRoleId)
            throw new ApiError(httpStatus.UNAUTHORIZED, "Não foi possível encontrar um papel para este usuário.");

        await prisma.token.delete({ where: { id: refreshTokenData.id } });
        return tokenService.generateAuthToken({ userId, currentRoleId: currentUserRoleId });
    };

    public static invalidateTokens = async ({
        refreshToken,
        accessToken,
    }: {
        refreshToken: string;
        accessToken: string;
    }) => {
        const refreshTokenData = await prisma.token.findFirst({
            where: { token: refreshToken, type: TokenType.REFRESH, blacklisted: false },
        });
        const accessTokenData = await prisma.token.findFirst({
            where: { token: accessToken, type: TokenType.ACCESS, blacklisted: false },
        });

        if (!refreshTokenData || !accessTokenData)
            throw new ApiError(httpStatus.NOT_FOUND, "Os dados fornecedidos são inválidos.");

        await prisma.token.deleteMany({ where: { id: { in: [refreshTokenData.id, accessTokenData.id] } } });
    };

    public static updateUserPassword = async (userId: string, newPassword: string) => {
        const user = await prisma.user.findUnique({ where: { id: userId, ativo: true } });
        if (!user) throw new ApiError(httpStatus.NOT_FOUND, "O usuário não existe no sistema.");

        const encriptPassword = await encryptPassword(newPassword);
        await prisma.user.update({ where: { id: userId, ativo: true }, data: { password: encriptPassword } });
    };

    public updateCurrentUserRole = async (newCurrentUserRoleId: string) => {
        const newCurrentUserRole = await prisma.userRole.findUnique({
            where: { id: newCurrentUserRoleId, userId: this.context.user.id, ativo: true },
        });
        if (!newCurrentUserRole)
            throw new ApiError(httpStatus.FORBIDDEN, "Seu usuário não está habilitado para este papel.");

        await prisma.token.update({
            where: { id: this.context.tokenInfo.id },
            data: { currentUserRoleId: newCurrentUserRoleId },
        });
    };
}
