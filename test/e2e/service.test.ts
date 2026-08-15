import AuthSupport from "../support/auth.support";
import server from "../../src/server";
import request from "supertest";
import "jest-extended";

import {
    rolesThatCanAddorUpdateServices,
    rolesThatCanManageAllServices,
    rolesThatCanReadAllServices,
} from "../support/role-permissions.support";
import { productServiceTypeA } from "../../prisma/seeds/models/product-service-type";
import { serviceA, serviceB, serviceC } from "../../prisma/seeds/models/service";
import { deleteSeedsFromDB, setSeedsInDB } from "../../prisma/seeds/scripts";
import { ApiTestRoutes } from "../support/api-test-routes";
import { NewService } from "../../src/types/service.types";
import { Role } from "@prisma/client";

describe("Gerenciando serviços", () => {
    const expectToBeInServices = {
        id: expect.toBeString(),
        name: expect.toBeString(),
        valorCustoHora: expect.toBeNumber(),
        observacoes: expect.toBeString(),
        tipoMoeda: expect.toBeString(),
        ativo: expect.toBeBoolean(),
        tipoProdutoServicoId: expect.toBeString(),
        tipoProdutoServico: expect.objectContaining({
            createdAt: expect.toBeDateString(),
            id: expect.toBeString(),
            name: expect.toBeString(),
            updatedAt: expect.toBeDateString(),
        }),
        empresaId: expect.toBeString(),
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
    };

    const newService: NewService = {
        name: "Novo Servico",
        tipoMoeda: "BRL",
        valorCustoHora: 70,
        observacoes: "Algo importante",
        tipoProdutoServicoId: productServiceTypeA.id,
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    rolesThatCanReadAllServices.forEach((role) =>
        it(`Deveria listar os serviços como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.SERVICE_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ sortBy: "name", limit: 10, sortType: "asc" })
                .expect(200);

            expect(res.body.length).toBe(3);

            for (let service of res.body) {
                expect(service).toStrictEqual(expectToBeInServices);
            }
        })
    );

    it("Deveria listar os serviços com filtrados", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const res = await request(server)
            .get(ApiTestRoutes.SERVICE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .query({ sortBy: "name", limit: 10, sortType: "asc", where: { observacoes: "muito importante" } })
            .expect(200);

        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toStrictEqual(serviceB.id);
        expect(res.body[0].name).toStrictEqual(serviceB.name);
    });

    rolesThatCanReadAllServices.forEach((role) =>
        it(`Deveria pegar um único serviço como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_SERVICE_ROUTE(serviceA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body).toStrictEqual(expectToBeInServices);
            expect(res.body.id).toStrictEqual(serviceA.id);
            expect(res.body.name).toStrictEqual(serviceA.name);
        })
    );

    it("Deveria gerar um erro 400 ao pegar um único serviço", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .get(ApiTestRoutes.PATCH_SERVICE_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    rolesThatCanAddorUpdateServices.forEach((role) =>
        it(`Deveria adicionar um novo serviço como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .post(ApiTestRoutes.SERVICE_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newService] })
                .expect(201);

            expect(res.body[0].name).toBe(newService.name);
            expect(res.body[0].tipoMoeda).toBe(newService.tipoMoeda);
            expect(res.body[0].valorCustoHora).toBe(newService.valorCustoHora);
            expect(res.body[0].observacoes).toBe(newService.observacoes);
            expect(res.body[0].tipoProdutoServicoId).toBe(newService.tipoProdutoServicoId);
        })
    );

    it("Deveria gerar um erro 400 ao adicionar um novo serviço com nome duplicado", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .post(ApiTestRoutes.SERVICE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newService, name: serviceA.name }] })
            .expect(400);
    });

    rolesThatCanAddorUpdateServices.forEach((role) =>
        it(`Deveria editar um serviço como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.PATCH_SERVICE_ROUTE(serviceA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newService })
                .expect(200);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_SERVICE_ROUTE(serviceA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body.id).toStrictEqual(serviceA.id);
            expect(res.body.name).toStrictEqual(newService.name);
            expect(res.body.tipoMoeda).toStrictEqual(newService.tipoMoeda);
            expect(res.body.valorCustoHora).toStrictEqual(newService.valorCustoHora);
            expect(res.body.observacoes).toStrictEqual(newService.observacoes);
        })
    );

    it("Deveria gerar erro 404 ao tentar editar um serviço inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_SERVICE_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: newService })
            .expect(404);
    });

    it("Deveria gerar erro 400 ao tentar editar um serviço com nome duplicado", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_SERVICE_ROUTE(serviceC.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...newService, name: serviceA.name } })
            .expect(400);
    });

    rolesThatCanManageAllServices.forEach((role) =>
        it(`Deveria deletar um serviço como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .delete(ApiTestRoutes.PATCH_SERVICE_ROUTE(serviceC.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(204);
        })
    );

    it("Deveria gerar erro 400 ao tentar deletar um serviço vinculado a uma serviceSale", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_SERVICE_ROUTE(serviceA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar deletar um serviço inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_SERVICE_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });
});
