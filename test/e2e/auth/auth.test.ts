import AuthSupport from "../../support/auth.support";
import server from "../../../src/server";
import request from "supertest";
import "jest-extended";

import { superUserChangeCurrentRoleCases, changePassRoleCases, loginCases } from "./auth.test-cases";
import { deleteSeedsFromDB, setSeedsInDB } from "../../../prisma/seeds/scripts";
import { ApiTestRoutes } from "../../support/api-test-routes";
import { admin } from "../../../prisma/seeds/models/user";
import { tokenService } from "../../../src/services";
import { Role } from "@prisma/client";

describe("Verificando acessos à API", () => {
    const expectToBeInLoginUserInfo = {
        id: expect.toBeString(),
        email: expect.toBeString(),
        name: expect.toBeString(),
        isEmailVerified: expect.toBeBoolean(),
        ativo: expect.toBeBoolean(),
        bloqueado: expect.toBeBoolean(),
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
    };

    const expectToBeInUserRole = {
        ativo: expect.toBeBoolean(),
        bloqueado: expect.toBeBoolean(),
        createdAt: expect.toBeDateString(),
        empresaId: expect.toBeString(),
        fixedCommission: expect.toBeBoolean(),
        id: expect.toBeString(),
        role: expect.toBeOneOf(Object.values(Role)),
        updatedAt: expect.toBeDateString(),
        userId: expect.toBeString(),
    };

    const expectedInTokens = {
        refresh: { token: expect.toBeString(), expires: expect.toBeDateString() },
        access: { token: expect.toBeString(), expires: expect.toBeDateString() },
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    loginCases.forEach(({ email, password, expected }) =>
        it(`Deveria receber status ${expected.status} ao logar na API com e-mail ${email}`, async () => {
            const res = await request(server)
                .post(ApiTestRoutes.LOGIN_ROUTE)
                .send({ email, password })
                .expect(expected.status);
            if (!expected.allowed) return;

            const { userRoles, ...userInfo } = res.body.user ?? {};
            const authTokens = res.body.tokens;

            expect(userInfo).toStrictEqual(expectToBeInLoginUserInfo);
            expect(userInfo.email).toBe(email);

            expect(userRoles.length).toBe(expected.amountRoles);
            expect(userRoles).toEqual(expect.arrayContaining([expect.objectContaining(expectToBeInUserRole)]));

            expect(authTokens).toStrictEqual(expectedInTokens);
        })
    );

    it("Deveria retornar um erro 401 quando credenciais incorretas", async () => {
        await request(server)
            .post(ApiTestRoutes.LOGIN_ROUTE)
            .send({ email: admin.email, password: "wrongPassword" })
            .expect(401);
    });

    //TODO: Não deveriamos mandar estas informações via posts. O logout deveria ser um get e a rota deve ser protegida.
    it("Deveria deslogar da API", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);
        const token = auth.access.token;
        const refreshToken = auth.refresh?.token;

        await request(server).post(ApiTestRoutes.LOGOUT_ROUTE).send({ accessToken: token, refreshToken }).expect(204);
        await request(server).post(ApiTestRoutes.LOGOUT_ROUTE).send({ accessToken: token, refreshToken }).expect(404);
    });

    it("Deveria enviar erro de 404 caso token inválido ao logout", async () => {
        await request(server)
            .post(ApiTestRoutes.LOGOUT_ROUTE)
            .send({ accessToken: "invalidToken", refreshToken: "invalidToken" })
            .expect(404);
    });

    it("Deveria enviar um e-mail informando o token para resetar a senha quando esquecida", async () => {
        await request(server)
            .post(ApiTestRoutes.FORGOT_PASSWORD_ROUTE)
            .send({ email: admin.email, redirect: "http://localhost:3000/reset-password" })
            .expect(204);
    });

    it("Deveria retornar um erro 404 ao tentar gerar token de reset de senha com email inexistente", async () => {
        await request(server)
            .post(ApiTestRoutes.FORGOT_PASSWORD_ROUTE)
            .send({ email: "email@inexistente.com", redirect: "http://localhost:3000/reset-password" })
            .expect(404);
    });

    it("Deveria retornar novos auth-tokens para manter viva a sessão", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);
        const refreshToken = auth.refresh?.token;

        const res = await request(server).post(ApiTestRoutes.KEEP_ALIVE_SESSION).send({ refreshToken }).expect(200);
        expect(res.body.refreshToken).toStrictEqual(expectedInTokens);
    });

    it("Deveria mudar a senha esquecida do usuário", async () => {
        const resetPasswordToken = await tokenService.generateResetPasswordToken(admin.email);
        const newPassword = "1234";
        await request(server)
            .post(ApiTestRoutes.RESET_FORGOT_PASSWORD_ROUTE)
            .query({ token: resetPasswordToken })
            .send({ password: newPassword })
            .expect(204);
        await request(server)
            .post(ApiTestRoutes.LOGIN_ROUTE)
            .send({ email: admin.email, password: newPassword })
            .expect(200);
    });

    it("Deveria retornar erro 500 caso token inválido ao tentar mudar senha esquecida do usuário", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);
        const refreshToken = auth.refresh?.token;

        await request(server)
            .post(ApiTestRoutes.RESET_FORGOT_PASSWORD_ROUTE)
            .query({ token: refreshToken })
            .send({ password: "newPassword2" })
            .expect(500);
    });

    changePassRoleCases.forEach(({ role, userEmail, newPassword, expectedStatus }) =>
        it(`Deveria receber ${expectedStatus} ao atualizar senha atual do usuário com e-mail ${userEmail} como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.UPDATE_PASSWORD_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ token: auth.access.token })
                .send({ password: newPassword })
                .expect(expectedStatus);

            await request(server)
                .post(ApiTestRoutes.LOGIN_ROUTE)
                .send({ email: userEmail, password: newPassword })
                .expect(200);
        })
    );

    superUserChangeCurrentRoleCases.map(({ newRoleId, currentRole, expected }) =>
        it(`Deveria receber ${expected.status} ao trocar de role como ${currentRole}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithMultipleRoles(currentRole);

            await request(server)
                .patch(ApiTestRoutes.CHANGE_CURRENT_ROLE_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: { userRoleId: newRoleId } })
                .expect(expected.status);

            if (!expected.allowed) return;

            const res = await request(server)
                .get(ApiTestRoutes.MY_USER_INFO_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body.currentUserRole.id).toBe(newRoleId);
        })
    );
});
