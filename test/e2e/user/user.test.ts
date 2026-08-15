import AuthSupport from "../../support/auth.support";
import SeedSupport from "../../support/seed.support";
import prisma from "../../../src/prisma/prisma";
import UserTestCases from "./user.test-cases";
import server from "../../../src/server";
import request from "supertest";
import "jest-extended";

import { COMERCIAL_ROLES, updateUserRolesType } from "../../../src/types/user-role.types";
import { admin, salePersonB, superUser } from "../../../prisma/seeds/models/user";
import { deleteSeedsFromDB, setSeedsInDB } from "../../../prisma/seeds/scripts";
import { DataCreateUser } from "../../../src/validations/user.validator";
import { adminRole } from "../../../prisma/seeds/models/user-role";
import { ApiTestRoutes } from "../../support/api-test-routes";
import { Role } from "@prisma/client";

describe("Gerenciando Usuários", () => {
    const USERS_AMOUNT = 10;

    const newUserPersonalInfo = { name: "Novo Gerente", email: "gerente@novogerente.com" };
    const newUser: DataCreateUser = {
        role: Role.COMMISSIONING_ANALYST,
        ...newUserPersonalInfo,
    };

    const expectToBeInUsers = {
        id: expect.toBeString(),
        name: expect.toBeString(),
        email: expect.toBeString(),
        ativo: true,
        bloqueado: false,
        isEmailVerified: false,
        updatedAt: expect.toBeDateString(),
        createdAt: expect.toBeDateString(),
        userRoles: expect.arrayContaining([
            expect.objectContaining({
                id: expect.toBeString(),
                updatedAt: expect.toBeDateString(),
                createdAt: expect.toBeDateString(),
                ativo: true,
                bloqueado: false,
                role: expect.toBeString(),
                fixedCommission: expect.toBeBoolean(),
                userId: expect.toBeString(),
                empresaId: expect.toBeString(),
            }),
        ]),
    };

    const USERROLES_TEST: updateUserRolesType = [
        {
            role: Role.COMMISSIONING_ANALYST,
            fixedCommission: false,
        },
        {
            role: Role.VENDEDOR,
            fixedCommission: false,
        },
    ];

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    UserTestCases.createAnyCases.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao adicionar qualquer usuário como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .post(ApiTestRoutes.USER_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newUser] })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.length).toBe(1);
            expect(res.body[0].name).toBe(newUser.name);
            expect(res.body[0].email).toBe(newUser.email);
            expect(res.body[0].ativo).toBe(true);
            expect(res.body[0].userRoles.at(0).role).toBe(newUser.role);
        })
    );

    UserTestCases.createByUserRolesCases.forEach(({ role, possibilities }) =>
        possibilities.forEach(({ expected, userRole }) =>
            it(`Deveria retornar ${expected.status} ao adicionar um usuário com role ${userRole} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                const res = await request(server)
                    .post(ApiTestRoutes.USER_ROUTE)
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .send({ data: [{ ...newUser, role: userRole }] })
                    .expect(expected.status);

                if (!expected.allowed) return;

                expect(res.body.length).toBe(1);
                expect(res.body[0].name).toBe(newUser.name);
                expect(res.body[0].email).toBe(newUser.email);
                expect(res.body[0].ativo).toBe(true);
                expect(res.body[0].userRoles.at(0).role).toBe(userRole);
            })
        )
    );

    it("Deveria gerar erro 400 ao adicionar usuário que já existe na empresa", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .post(ApiTestRoutes.USER_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newUser, email: admin.email }] })
            .expect(400);
    });

    UserTestCases.updateAnyCases.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao editar um usuário como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .patch(ApiTestRoutes.PATCH_USER_ROUTE(salePersonB.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newUserPersonalInfo })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.name).toBe(newUser.name);
            expect(res.body.email).toBe(newUser.email);
        })
    );

    UserTestCases.updateByUserRolesCases.forEach(({ role, possibilities }) =>
        possibilities.forEach(({ expected, userRole }) =>
            it(`Deveria retornar ${expected.status} ao editar o usuário de role ${userRole} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                const isAComercialNotManagerRole =
                    COMERCIAL_ROLES.includes(userRole) && Role.COMERCIAL_MANAGER !== userRole;
                const userToUpdateInfo = SeedSupport.getUserWithUniqueRoleBy(userRole);

                await request(server)
                    .patch(ApiTestRoutes.PATCH_USER_ROUTE(userToUpdateInfo.id))
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .query({ onlyComercialNotManagerRoles: isAComercialNotManagerRole ? "true" : "false" })
                    .send({ data: newUserPersonalInfo })
                    .expect(expected.status);
            })
        )
    );

    it("Deveria gerar erro 404 ao editar um usuário inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_USER_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: newUserPersonalInfo })
            .expect(404);
    });

    it("Deveria gerar erro 400 ao editar um usuário com email igual a outro", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_USER_ROUTE(salePersonB.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...newUserPersonalInfo, email: admin.email } })
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar editar as roles de um usuário inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_USER_ROLE_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { userRoles: USERROLES_TEST } })
            .expect(404);
    });

    it("Deveria gerar erro 400 ao tentar remover a role de admin do único admin", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        // await request(server)
        //     .patch(ApiTestRoutes.PATCH_USER_ROUTE(superUser.id))
        //     .set("Authorization", `Bearer ${auth.access.token}`)
        //     .send({ data: { userRoles: USERROLES_TEST } })
        //     .expect(200); //got 400

        await request(server)
            .patch(ApiTestRoutes.PATCH_USER_ROUTE(admin.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { userRoles: USERROLES_TEST } })
            .expect(400);
    });

    UserTestCases.deleteAnyCases.forEach(({ role, expected }) =>
        it(`Deveria retornar o status correto ao deletar um usuário como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const hasUnpaid = await prisma.comissao.findFirst({
                where: { userRole: { userId: salePersonB.id }, comissaoPaga: false },
            });

            let expectedStatus = expected.status;
            if (role === Role.ADMIN) {
                expectedStatus = hasUnpaid ? 400 : 204;
            }

            await request(server)
                .delete(ApiTestRoutes.PATCH_USER_ROUTE(salePersonB.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expectedStatus);
        })
    );

    UserTestCases.deleteByUserRolesCases.forEach(({ role, possibilities }) =>
        possibilities.forEach(({ userRole, expected }) =>
            it(`Deveria retornar ${expected.status} ao deletar um usuário com role ${userRole} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                const userToDelete = SeedSupport.getUserWithUniqueRoleBy(userRole);
                const isAComercialNotManagerRole =
                    COMERCIAL_ROLES.includes(userRole) && Role.COMERCIAL_MANAGER !== userRole;

                // determina se tem comissões não pagas do usuário
                const hasUnpaid = await prisma.comissao.findFirst({
                    where: { userRole: { userId: userToDelete.id }, comissaoPaga: false },
                });

                let expectedStatus = expected.status;
                if (role === Role.ADMIN || (role === Role.COMERCIAL_MANAGER && expected.allowed)) {
                    expectedStatus = hasUnpaid ? 400 : 204;
                }

                await request(server)
                    .delete(ApiTestRoutes.PATCH_USER_ROUTE(userToDelete.id))
                    .query({ onlyComercialNotManagerRoles: isAComercialNotManagerRole ? "true" : "false" })
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .expect(expectedStatus);
            })
        )
    );

    it("Deveria gerar erro 400 ao tentar deletar o único administrador restante", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .delete(ApiTestRoutes.PATCH_USER_ROUTE(superUser.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(204);

        await request(server)
            .delete(ApiTestRoutes.PATCH_USER_ROUTE(admin.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar deletar um usuário inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_USER_ROUTE("fake_id"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    it("Deveria gerar erro 400 ao tentar deletar um usuário que possui comissões não pagas", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .delete(ApiTestRoutes.PATCH_USER_ROUTE(salePersonB.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });

    it("Deveria retornar as informações do usuário logado", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const res = await request(server)
            .get(ApiTestRoutes.MY_USER_INFO_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(200);

        expect(res.body).toStrictEqual({
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                isEmailVerified: false,
                bloqueado: false,
                ativo: true,
                createdAt: expect.toBeDateString(),
                updatedAt: expect.toBeDateString(),
                userRoles: expect.arrayContaining([
                    expect.objectContaining({ role: expect.toBeOneOf([Role.ADMIN, Role.VENDEDOR]) }),
                ]),
            },
            regrasHabilidades: expect.anything(),
            currentUserRole: {
                id: adminRole.id,
                createdAt: expect.toBeDateString(),
                empresa: {
                    cnpj: expect.toBeString(),
                    createdAt: expect.toBeDateString(),
                    id: expect.toBeString(),
                    name: expect.toBeString(),
                    updatedAt: expect.toBeDateString(),
                    empresaLogoSrc: expect.toBeOneOf([null, expect.toBeString()]),
                    empresaLogo: expect.toBeOneOf([null, expect.toBeObject()]),
                    empresaLogoId: expect.toBeOneOf([null, expect.toBeString()]),
                },
                updatedAt: expect.toBeDateString(),
                ativo: true,
                bloqueado: false,
                userId: admin.id,
                role: adminRole.role,
                fixedCommission: expect.toBeBoolean(),
                empresaId: expect.toBeString(),
            },
        });
    });

    UserTestCases.readAnyCases.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao listar os usuários sem restrição como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.USER_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.length).toBe(expected.allowed ? USERS_AMOUNT + 1 : USERS_AMOUNT);

            for (let user of res.body) {
                expect(user).toStrictEqual(expectToBeInUsers);
            }
        })
    );

    UserTestCases.readByUserIdCases.forEach(({ role, possibilities }) =>
        possibilities.forEach(({ userId, expected }) =>
            it(`Deveria retornar ${expected.status} ao listar os usuários pelo id ${userId} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                const res = await request(server)
                    .get(ApiTestRoutes.USER_ROUTE)
                    .query({ where: { id: userId } })
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .expect(expected.status);

                if (!expected.allowed) return;

                expect(res.body.length).toBe(1);

                for (let user of res.body) {
                    expect(user).toStrictEqual(expectToBeInUsers);
                }
            })
        )
    );
});
