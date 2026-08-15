import AuthSupport from "../support/auth.support";
import server from "../../src/server";
import request from "supertest";
import "jest-extended";

import {
    rolesThatCanAddorUpdateProducts,
    rolesThatCanManageAllProducts,
    rolesThatCanReadAllProducts,
} from "../support/role-permissions.support";
import { productA, productB, productD, productE } from "../../prisma/seeds/models/product";
import { productServiceTypeA } from "../../prisma/seeds/models/product-service-type";
import { deleteSeedsFromDB, setSeedsInDB } from "../../prisma/seeds/scripts";
import { manufacturerA } from "../../prisma/seeds/models/manufacturer";
import { categoryA } from "../../prisma/seeds/models/category";
import { NewProduct } from "../../src/types/product.types";
import { ApiTestRoutes } from "../support/api-test-routes";
import { Role } from "@prisma/client";

describe("Gerenciando produtos", () => {
    const expectToBeInProducts = {
        id: expect.toBeString(),
        name: expect.toBeString(),
        partNumber: expect.toBeString(),
        ativo: expect.toBeBoolean(),
        custoUnit: expect.toBeOneOf([expect.toBeNumber(), null]),
        empresaId: expect.toBeString(),
        tipoMoeda: expect.toBeString(),
        tipoProdutoServicoId: expect.toBeString(),
        tipoProdutoServico: expect.objectContaining({
            createdAt: expect.toBeDateString(),
            id: expect.toBeString(),
            name: expect.toBeString(),
            updatedAt: expect.toBeDateString(),
        }),
        categoriaId: expect.toBeString(),
        categoria: expect.objectContaining({
            createdAt: expect.toBeDateString(),
            id: expect.toBeString(),
            name: expect.toBeString(),
            updatedAt: expect.toBeDateString(),
        }),
        fabricanteId: expect.toBeString(),
        fabricante: expect.objectContaining({
            createdAt: expect.toBeDateString(),
            id: expect.toBeString(),
            name: expect.toBeString(),
            updatedAt: expect.toBeDateString(),
        }),
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
    };

    const newProduct: NewProduct = {
        fabricanteId: manufacturerA.id,
        partNumber: "novoPartNumber",
        name: "Novo Produto",
        custoUnit: 1000,
        categoriaId: categoryA.id,
        tipoMoeda: "BRL",
        tipoProdutoServicoId: productServiceTypeA.id,
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    rolesThatCanReadAllProducts.forEach((role) =>
        it(`Deveria listar os produtos como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PRODUCT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ sortBy: "name", limit: 10, sortType: "asc" })
                .expect(200);

            expect(res.body.length).toBe(5);

            for (let product of res.body) {
                expect(product).toStrictEqual(expectToBeInProducts);
            }
        })
    );

    it("Deveria listar os produtos filtrados", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const res = await request(server)
            .get(ApiTestRoutes.PRODUCT_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .query({
                sortBy: "name",
                limit: 1,
                sortType: "asc",
                where: { partNumber: "prod", categoriaId: categoryA.id },
            })
            .expect(200);

        expect(res.body.length).toBe(1);

        for (let product of res.body) {
            expect(product).toMatchObject({
                partNumber: expect.toInclude("prod"),
                categoriaId: categoryA.id,
            });
        }
    });

    rolesThatCanReadAllProducts.forEach((role) =>
        it(`Deveria pegar um único produto como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_PRODUCT_ROUTE(productA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body).toStrictEqual(expectToBeInProducts);
            expect(res.body.id).toBe(productA.id);
            expect(res.body.partNumber).toBe(productA.partNumber);
            expect(res.body.name).toBe(productA.name);
        })
    );

    it("Deveria retornar erro 404 ao tentar pegar um único produto inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .get(ApiTestRoutes.PATCH_PRODUCT_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    rolesThatCanAddorUpdateProducts.forEach((role) =>
        it(`Deveria adicionar um novo produto como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .post(ApiTestRoutes.PRODUCT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newProduct] })
                .expect(201);

            expect(res.body.length).toBe(1);
            expect(res.body[0].partNumber).toBe(newProduct.partNumber);
            expect(res.body[0].name).toBe(newProduct.name);
        })
    );

    it("Deveria gerar erro 400 ao tentar adicionar um produto com partNumber já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .post(ApiTestRoutes.PRODUCT_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newProduct, partNumber: productA.partNumber }] })
            .expect(400);
    });

    rolesThatCanAddorUpdateProducts.forEach((role) =>
        it(`Deveria editar um produto como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.PATCH_PRODUCT_ROUTE(productA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newProduct })
                .expect(200);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_PRODUCT_ROUTE(productA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body).toStrictEqual(expectToBeInProducts);
            expect(res.body.id).toBe(productA.id);
            expect(res.body.partNumber).toBe(newProduct.partNumber);
            expect(res.body.name).toBe(newProduct.name);
            expect(res.body.custoUnit).toBe(newProduct.custoUnit);
        })
    );

    it("Deveria gerar erro 400 ao tentar editar um produto com partNumber já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_PRODUCT_ROUTE(productA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...newProduct, partNumber: productB.partNumber } })
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar editar um produto inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_PRODUCT_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: newProduct })
            .expect(404);
    });

    rolesThatCanManageAllProducts.forEach((role) =>
        it(`Deveria deletar um produto como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .delete(ApiTestRoutes.PATCH_PRODUCT_ROUTE(productE.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(204);
        })
    );

    it("Deveria gerar erro 400 ao tentar deletar um produto vinculado a uma productSale", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_PRODUCT_ROUTE(productA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar deletar um produto inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_PRODUCT_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });
});
