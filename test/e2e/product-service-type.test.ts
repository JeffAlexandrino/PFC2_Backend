import AuthSupport from "../support/auth.support";
import server from "../../src/server";
import request from "supertest";
import "jest-extended";

import {
    rolesThatCanAddorUpdatePSTypes,
    rolesThatCanManageAllPSTypes,
    rolesThatCanReadAllPSTypes,
} from "../support/role-permissions.support";
import {
    productServiceTypeA,
    productServiceTypeB,
    productServiceTypeC,
} from "../../prisma/seeds/models/product-service-type";
import { NewProductServiceType } from "../../src/types/product-service-type.types";
import { deleteSeedsFromDB, setSeedsInDB } from "../../prisma/seeds/scripts";
import { ApiTestRoutes } from "../support/api-test-routes";
import { Role } from "@prisma/client";

describe("Gerenciando tipos de produto ou serviço", () => {
    const expectToBeInProductServiceTypes = {
        id: expect.toBeString(),
        name: expect.toBeString(),
        empresaId: expect.toBeString(),
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
    };

    const newType: NewProductServiceType = {
        name: "TipoNovo",
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    rolesThatCanReadAllPSTypes.forEach((role) =>
        it(`Deveria listar os tiposProdServ ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PRODUCT_SERVICE_TYPE_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ sortBy: "name", limit: 10, sortType: "asc" })
                .expect(200);

            expect(res.body.length).toBe(3);

            for (let type of res.body) {
                expect(type).toStrictEqual(expectToBeInProductServiceTypes);
            }
        })
    );

    rolesThatCanReadAllPSTypes.forEach((role) =>
        it(`Deveria pegar um único tipoProdServ como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_PRODUCT_SERVICE_TYPE_ROUTE(productServiceTypeA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body).toStrictEqual(expectToBeInProductServiceTypes);
            expect(res.body.id).toBe(productServiceTypeA.id);
            expect(res.body.name).toBe(productServiceTypeA.name);
        })
    );

    it("Deveria retornar erro 404 ao tentar pegar tipoProdServ inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .get(ApiTestRoutes.PATCH_PRODUCT_SERVICE_TYPE_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    rolesThatCanAddorUpdatePSTypes.forEach((role) =>
        it(`Deveria adicionar um novo tipoProdServ como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .post(ApiTestRoutes.PRODUCT_SERVICE_TYPE_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newType] })
                .expect(201);

            expect(res.body[0].name).toBe(newType.name);
        })
    );

    it("Deveria gerar erro 400 ao tentar adicionar um tipoProdServ que já existe", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .post(ApiTestRoutes.PRODUCT_SERVICE_TYPE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newType, name: productServiceTypeA.name }] })
            .expect(400);
    });

    rolesThatCanAddorUpdatePSTypes.forEach((role) =>
        it(`Deveria editar um tipoProdServ como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.PATCH_PRODUCT_SERVICE_TYPE_ROUTE(productServiceTypeA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newType })
                .expect(200);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_PRODUCT_SERVICE_TYPE_ROUTE(productServiceTypeA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body.id).toBe(productServiceTypeA.id);
            expect(res.body.name).toBe(newType.name);
        })
    );

    it("Deveria gerar erro 400 ao tentar editar um tipoProdServ que já existe", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_PRODUCT_SERVICE_TYPE_ROUTE(productServiceTypeA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...newType, name: productServiceTypeB.name } })
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar editar um tipoProdServ que não existe", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_PRODUCT_SERVICE_TYPE_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: newType })
            .expect(404);
    });

    rolesThatCanManageAllPSTypes.forEach((role) =>
        it(`Deveria deletar um tipoProdServ como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .delete(ApiTestRoutes.PATCH_PRODUCT_SERVICE_TYPE_ROUTE(productServiceTypeC.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(204);
        })
    );

    it("Deveria gerar erro 400 ao tentar deletar um tipoProdServ que está vinculado a um produto", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_PRODUCT_SERVICE_TYPE_ROUTE(productServiceTypeA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar deletar um tipoProdServ que não existe", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_PRODUCT_SERVICE_TYPE_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });
});
