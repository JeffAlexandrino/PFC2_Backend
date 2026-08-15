import {
    rolesThatCanAddCustomers,
    rolesThatCanManageAllCustomers,
    rolesThatCanReadAllCustomers,
    rolesThatCanUpdateAllCustomers,
} from "../support/role-permissions.support";
import { customerA, customerB, customerC, segmentA } from "../../prisma/seeds/models/customer";
import { NewCustomer, NewCustomerWithSegmentName } from "../../src/types/customer.types";
import { deleteSeedsFromDB, setSeedsInDB } from "../../prisma/seeds/scripts";
import { ApiTestRoutes } from "../support/api-test-routes";
import { Role } from "@prisma/client";

import AuthSupport from "../support/auth.support";
import server from "../../src/server";
import request from "supertest";
import "jest-extended";

describe("Gerenciando clientes", () => {
    const expectToBeInCustomers = {
        id: expect.toBeString(),
        name: expect.toBeString(),
        cnpj: expect.toBeString(),
        email: expect.toBeString(),
        empresaId: expect.toBeString(),
        telefone: expect.toBeString(),
        comprou: expect.toBeBoolean(),
        segmentoId: expect.toBeString(),
        segmento: expect.objectContaining({
            id: expect.toBeString(),
            name: expect.toBeString(),
            createdAt: expect.toBeDateString(),
            updatedAt: expect.toBeDateString(),
        }),
        responsavelId: expect.toBeOneOf([null, expect.toBeString()]),
        responsavel: expect.toBeOneOf([
            null,
            expect.objectContaining({
                id: expect.toBeString(),
                name: expect.toBeString(),
            }),
        ]),
        origem: expect.toBeString(),
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
    };

    const newCustomer: NewCustomer = {
        name: "ClienteNovo",
        cnpj: "32729982000143",
        email: "clientenovo@email.com",
        telefone: "48996137636",
        origem: "CELLPHONE",
        segmentoId: segmentA.id,
    };

    const newImportCustomer: NewCustomerWithSegmentName = {
        name: "ClienteNovo",
        cnpj: "32729982000143",
        email: "clientenovo@email.com",
        telefone: "48996137636",
        origem: "INSTAGRAM",
        segmentoName: segmentA.name,
    };

    const duplicatedCustomer: NewCustomer = {
        name: "ClienteNovo",
        cnpj: customerA.cnpj,
        email: customerA.email,
        telefone: "48996137636",
        origem: "LINKEDIN",
        segmentoId: segmentA.id,
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    rolesThatCanReadAllCustomers.forEach((role) =>
        it(`Deveria listar os clientes como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.CUSTOMER_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ sortBy: "name", limit: 10, sortType: "desc" })
                .expect(200);

            expect(res.body.length).toBe(3);

            for (let customer of res.body) {
                expect(customer).toStrictEqual(expectToBeInCustomers);
            }
        })
    );

    it("Deveria listar os clientes com filtro", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const res = await request(server)
            .get(ApiTestRoutes.CUSTOMER_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .query({ where: { cnpj: customerA.cnpj }, sortBy: "name", limit: 10, sortType: "desc" })
            .expect(200);

        expect(res.body.length).toBe(1);
        expect(res.body[0].cnpj).toBe(customerA.cnpj);

        for (let cliente of res.body) {
            expect(cliente).toStrictEqual(expectToBeInCustomers);
        }
    });

    rolesThatCanReadAllCustomers.forEach((role) =>
        it(`Deveria pegar um único cliente como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_CUSTOMER_ROUTE(customerA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body.id).toBe(customerA.id);
            expect(res.body.cnpj).toBe(customerA.cnpj);
            expect(res.body.name).toBe(customerA.name);
            expect(res.body.origem).toBe(customerA.origem);
            expect(res.body.responsavelId).toBe(customerA.responsavelId);

            expect(res.body).toStrictEqual(expectToBeInCustomers);
        })
    );

    it("Deveria gerar um erro 404 ao pegar um único cliente inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .get(ApiTestRoutes.PATCH_CUSTOMER_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    rolesThatCanAddCustomers.forEach((role) =>
        it(`Deveria adicionar um novo cliente como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .post(ApiTestRoutes.CUSTOMER_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newCustomer] })
                .expect(201);

            expect(res.body[0].name).toBe(newCustomer.name);
            expect(res.body[0].cnpj).toBe(newCustomer.cnpj);
            expect(res.body[0].email).toBe(newCustomer.email);
            expect(res.body[0].telefone).toBe(newCustomer.telefone);
            expect(res.body[0].segmentoId).toBe(newCustomer.segmentoId);
        })
    );

    it("Deveria enviar erro 400 se email já está cadastrado ao criar", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .post(ApiTestRoutes.CUSTOMER_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newCustomer, email: customerA.email }] })
            .expect(400);
    });

    it("Deveria enviar erro 400 se cnpj já está cadastrado ao criar", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .post(ApiTestRoutes.CUSTOMER_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newCustomer, cnpj: customerA.cnpj }] })
            .expect(400);
    });

    rolesThatCanAddCustomers.forEach((role) =>
        it(`Deveria importar um novo cliente como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .post(ApiTestRoutes.CUSTOMER_IMPORT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newImportCustomer] })
                .expect(201);

            const res = await request(server)
                .get(ApiTestRoutes.CUSTOMER_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ where: { email: newCustomer.email } })
                .expect(200);

            expect(res.body[0].name).toBe(newImportCustomer.name);
            expect(res.body[0].cnpj).toBe(newImportCustomer.cnpj);
            expect(res.body[0].email).toBe(newImportCustomer.email);
            expect(res.body[0].telefone).toBe(newImportCustomer.telefone);
            expect(res.body[0].segmentoId).toBe(segmentA.id);
        })
    );

    rolesThatCanUpdateAllCustomers.forEach((role) =>
        it(`Deveria editar um cliente como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.PATCH_CUSTOMER_ROUTE(customerA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newCustomer })
                .expect(200);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_CUSTOMER_ROUTE(customerA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body.email).toBe(newCustomer.email);
            expect(res.body.cnpj).toBe(newCustomer.cnpj);
            expect(res.body.name).toBe(newCustomer.name);
        })
    );

    it("Deveria gerar erro 404 ao tentar editar um cliente inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_CUSTOMER_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: newCustomer })
            .expect(404);
    });

    // rolesThatCanUpdateAllCustomers.forEach((role expected) =>
    //     it(`Deveria retornar ${expected.status} editar um cliente como ${role}`, async () => {
    //         const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

    //         await request(server)
    //             .patch(ApiTestRoutes.PATCH_CUSTOMER_ROUTE(customerC.id))
    //             .set("Authorization", `Bearer ${auth.access.token}`)
    //             .expect(expected.status);
    //     })
    // );

    it("Deveria enviar erro 400 se email cliente já está cadastrado ao editar", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_CUSTOMER_ROUTE(customerB.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: duplicatedCustomer })
            .expect(400);
    });

    it("Deveria enviar erro 400 se cnpj cliente já está cadastrado ao editar", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_CUSTOMER_ROUTE(customerB.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: duplicatedCustomer })
            .expect(400);
    });

    rolesThatCanManageAllCustomers.forEach((role) =>
        it(`Deveria deletar um cliente como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .delete(ApiTestRoutes.PATCH_CUSTOMER_ROUTE(customerC.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(204);
        })
    );

    it("Deveria gerar erro 400 ao tentar deletar um cliente utilizado", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .delete(ApiTestRoutes.PATCH_CUSTOMER_ROUTE(customerA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar deletar um cliente inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .delete(ApiTestRoutes.PATCH_CUSTOMER_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });
});
