import AuthSupport from "../support/auth.support";
import server from "../../src/server";
import request from "supertest";
import "jest-extended";

import {
    rolesThatCanAddorUpdatePaymentMethod,
    rolesThatCanManageAllPaymentMethod,
    rolesThatCanReadAllPaymentMethod,
} from "../support/role-permissions.support";
import { paymentMethodA, paymentMethodB } from "../../prisma/seeds/models/payment-method";
import { deleteSeedsFromDB, setSeedsInDB } from "../../prisma/seeds/scripts";
import { NewPaymentMethod } from "../../src/types/payment-method.types";
import { ApiTestRoutes } from "../support/api-test-routes";
import { Role } from "@prisma/client";

describe("Gerenciando formas de pagamento", () => {
    const expectToBeInPaymentMethods = {
        id: expect.toBeString(),
        name: expect.toBeString(),
        empresaId: expect.toBeString(),
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
    };

    const newPaymentMethod: NewPaymentMethod = {
        name: "FormaPagamentoNova",
    };
    const formaPagamentoEditar: NewPaymentMethod = {
        name: "FormaPagamentoEditar",
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    rolesThatCanReadAllPaymentMethod.map((role) =>
        it(`Deveria listar as formas de pagamento como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PAYMENT_METHOD_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ sortBy: "createdAt", limit: 10, sortType: "asc" })
                .expect(200);

            expect(res.body.length).toBe(2);

            for (let vendedor of res.body) {
                expect(vendedor).toStrictEqual(expectToBeInPaymentMethods);
            }
        })
    );

    rolesThatCanReadAllPaymentMethod.map((role) =>
        it(`Deveria pegar uma única forma de pagamento ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_PAYMENT_METHOD_ROUTE(paymentMethodA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body).toStrictEqual(expectToBeInPaymentMethods);
            expect(res.body.id).toBe(paymentMethodA.id);
            expect(res.body.name).toBe(paymentMethodA.name);
        })
    );

    it("Deveria retornar erro 404 ao pegar uma única forma de pagamento inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .get(ApiTestRoutes.PATCH_PAYMENT_METHOD_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    rolesThatCanAddorUpdatePaymentMethod.map((role) =>
        it(`Deveria adicionar uma nova forma de pagamento ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .post(ApiTestRoutes.PAYMENT_METHOD_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newPaymentMethod] })
                .expect(201);

            expect(res.body[0].name).toBe(newPaymentMethod.name);
        })
    );

    it("Deveria gerar erro 400 ao tentar adicionar uma forma de pagamento já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .post(ApiTestRoutes.PAYMENT_METHOD_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newPaymentMethod, name: paymentMethodA.name }] })
            .expect(400);
    });

    rolesThatCanAddorUpdatePaymentMethod.map((role) =>
        it(`Deveria editar uma forma de pagamento ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.PATCH_PAYMENT_METHOD_ROUTE(paymentMethodA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newPaymentMethod })
                .expect(200);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_PAYMENT_METHOD_ROUTE(paymentMethodA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body).toStrictEqual(expectToBeInPaymentMethods);
            expect(res.body.id).toBe(paymentMethodA.id);
            expect(res.body.name).toBe(newPaymentMethod.name);
        })
    );

    it("Deveria gerar erro 400 ao tentar editar uma forma de pagamento já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_PAYMENT_METHOD_ROUTE(paymentMethodA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...newPaymentMethod, name: paymentMethodB.name } })
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar editar uma forma de pagamento inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_PAYMENT_METHOD_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: formaPagamentoEditar })
            .expect(404);
    });

    rolesThatCanManageAllPaymentMethod.map((role) =>
        it(`Deveria deletar uma forma de pagamento ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .delete(ApiTestRoutes.PATCH_PAYMENT_METHOD_ROUTE(paymentMethodB.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(204);
        })
    );

    it("Deveria gerar erro 400 ao tentar deletar uma forma de pagamento vinculada a uma venda", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_PAYMENT_METHOD_ROUTE(paymentMethodA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar deletar uma forma de pagamento inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_PAYMENT_METHOD_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });
});
