import AuthSupport from "../support/auth.support";
import server from "../../src/server";
import request from "supertest";
import "jest-extended";

import {
    rolesThatCanAddorUpdateSupplier,
    rolesThatCanManageAllSuppliers,
    rolesThatCanReadAllSuppliers,
} from "../support/role-permissions.support";
import { supplierA, supplierB, supplierC } from "../../prisma/seeds/models/supplier";
import { deleteSeedsFromDB, setSeedsInDB } from "../../prisma/seeds/scripts";
import { NewSupplier } from "../../src/types/supplier.types";
import { ApiTestRoutes } from "../support/api-test-routes";
import { Role } from "@prisma/client";

describe("Gerenciando fornecedores", () => {
    const expectToBeInSuppliers = {
        id: expect.toBeString(),
        name: expect.toBeString(),
        cnpj: expect.toBeString(),
        email: expect.toBeString(),
        empresaId: expect.toBeString(),
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
    };

    const newSupplier: NewSupplier = {
        name: "FornecedorNovo",
        cnpj: "05607657000801",
        email: "novoFornecedor@email.com",
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    rolesThatCanReadAllSuppliers.forEach((role) =>
        it(`Deveria listar os fornecedores como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.SUPPLIERS_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ sortBy: "createdAt", limit: 10, sortType: "asc" })
                .expect(200);

            expect(res.body.length).toBe(3);

            for (let vendedor of res.body) {
                expect(vendedor).toStrictEqual(expectToBeInSuppliers);
            }
        })
    );

    rolesThatCanReadAllSuppliers.forEach((role) =>
        it(`Deveria pegar um único fornecedor como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_SUPPLIERS_ROUTE(supplierA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body).toStrictEqual(expectToBeInSuppliers);
            expect(res.body.id).toBe(supplierA.id);
            expect(res.body.name).toBe(supplierA.name);
            expect(res.body.cnpj).toBe(supplierA.cnpj);
            expect(res.body.email).toBe(supplierA.email);
        })
    );

    it("Deveria retornar erro 404 ao pegar um único fornecedor inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .get(ApiTestRoutes.PATCH_SUPPLIERS_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    rolesThatCanAddorUpdateSupplier.forEach((role) =>
        it(`Deveria adicionar um novo fornecedor como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .post(ApiTestRoutes.SUPPLIERS_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newSupplier] })
                .expect(201);

            expect(res.body.length).toBe(1);
            expect(res.body[0].name).toBe(newSupplier.name);
            expect(res.body[0].cnpj).toBe(newSupplier.cnpj);
            expect(res.body[0].email).toBe(newSupplier.email);
        })
    );

    it("Deveria gerar erro 400 ao tentar adicionar um fornecedor com CNPJ já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .post(ApiTestRoutes.SUPPLIERS_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newSupplier, cnpj: supplierA.cnpj }] })
            .expect(400);
    });

    it("Deveria gerar erro 400 ao tentar adicionar um fornecedor com e-mail já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .post(ApiTestRoutes.SUPPLIERS_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newSupplier, email: supplierA.email }] })
            .expect(400);
    });

    rolesThatCanAddorUpdateSupplier.forEach((role) =>
        it(`Deveria editar um fornecedor como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.PATCH_SUPPLIERS_ROUTE(supplierA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newSupplier })
                .expect(200);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_SUPPLIERS_ROUTE(supplierA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body).toStrictEqual(expectToBeInSuppliers);
            expect(res.body.id).toBe(supplierA.id);
            expect(res.body.name).toBe(newSupplier.name);
            expect(res.body.cnpj).toBe(newSupplier.cnpj);
            expect(res.body.email).toBe(newSupplier.email);
        })
    );

    it("Deveria gerar erro 400 ao tentar editar um fornecedor com CNPJ já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_SUPPLIERS_ROUTE(supplierA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...newSupplier, cnpj: supplierB.cnpj } })
            .expect(400);
    });

    it("Deveria gerar erro 400 ao tentar editar um fornecedor com email já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_SUPPLIERS_ROUTE(supplierA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...newSupplier, email: supplierB.email } })
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar editar um fornecedor inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_SUPPLIERS_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: newSupplier })
            .expect(404);
    });

    rolesThatCanManageAllSuppliers.forEach((role) =>
        it(`Deveria deletar um fornecedor ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .delete(ApiTestRoutes.PATCH_SUPPLIERS_ROUTE(supplierC.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(204);
        })
    );

    it("Deveria gerar erro 400 ao deletar um fornecedor que está vinculado a uma productSale", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_SUPPLIERS_ROUTE(supplierB.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar deletar um fornecedor inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_SUPPLIERS_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });
});
