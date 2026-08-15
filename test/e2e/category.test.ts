import AuthSupport from "../support/auth.support";
import server from "../../src/server";
import request from "supertest";
import "jest-extended";

import {
    rolesThatCanAddorUpdateCategorys,
    rolesThatCanManageAllCategorys,
    rolesThatCanReadAllCategorys,
} from "../support/role-permissions.support";
import { categoryA, categoryB, categoryC } from "../../prisma/seeds/models/category";
import { deleteSeedsFromDB, setSeedsInDB } from "../../prisma/seeds/scripts";
import { organizationA } from "../../prisma/seeds/models/organization";
import { NewCategory } from "../../src/types/category.types";
import { ApiTestRoutes } from "../support/api-test-routes";
import { Role } from "@prisma/client";

describe("Gerenciando categorias", () => {
    const newCategory: NewCategory = { name: "Nova categoria" };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    rolesThatCanReadAllCategorys.forEach((role) =>
        it(`Deveria listar as categorias como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.CATEGORY_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ sortBy: "name", limit: 10, sortType: "desc" })
                .expect(200);

            const categoriesFounded = res.body;

            expect(categoriesFounded.length).toBe(3);

            expect(categoriesFounded).toStrictEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.toBeOneOf([categoryA.id, categoryB.id, categoryC.id]),
                        name: expect.toBeOneOf([categoryA.name, categoryB.name, categoryC.name]),
                        empresaId: organizationA.id,
                        createdAt: expect.toBeDateString(),
                        updatedAt: expect.toBeDateString(),
                    }),
                ])
            );
        })
    );

    rolesThatCanReadAllCategorys.forEach((role) =>
        it(`Deveria pegar uma única categoria como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_CATEGORY_ROUTE(categoryA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body).toStrictEqual({
                id: categoryA.id,
                name: categoryA.name,
                empresaId: categoryA.empresaId,
                createdAt: expect.toBeDateString(),
                updatedAt: expect.toBeDateString(),
            });
        })
    );

    it("Deveria retornar erro 404 ao pegar uma única categoria inexistentes", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .get(ApiTestRoutes.PATCH_CATEGORY_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    rolesThatCanAddorUpdateCategorys.forEach((role) =>
        it(`Deveria adicionar uma nova categoria como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .post(ApiTestRoutes.CATEGORY_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newCategory] })
                .expect(201);

            expect(res.body[0]).toMatchObject({
                id: expect.toBeString(),
                name: newCategory.name,
                empresaId: organizationA.id,
            });
        })
    );

    it("Deveria gerar erro 400 ao tentar adicionar uma categoria com nome já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .post(ApiTestRoutes.CATEGORY_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newCategory, name: categoryA.name }] })
            .expect(400);
    });

    rolesThatCanManageAllCategorys.forEach((role) =>
        it(`Deveria editar uma categoria ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .patch(ApiTestRoutes.PATCH_CATEGORY_ROUTE(categoryA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newCategory })
                .expect(200);
        })
    );

    it("Deveria gerar erro 400 ao tentar editar uma categoria com nome já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_CATEGORY_ROUTE(categoryB.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...newCategory, name: categoryA.name } })
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar editar uma categoria inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_CATEGORY_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: newCategory })
            .expect(404);
    });

    rolesThatCanManageAllCategorys.forEach((role) =>
        it(`Deveria deletar uma categoria como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .delete(ApiTestRoutes.PATCH_CATEGORY_ROUTE(categoryC.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(204);
        })
    );

    it("Deveria gerar erro 400 ao tentar deletar uma categoria que está sendo utilizada em outro lugar", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_CATEGORY_ROUTE(categoryA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar deletar uma categoria inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_CATEGORY_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });
});
