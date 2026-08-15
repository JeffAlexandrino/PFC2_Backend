import AuthSupport from "../support/auth.support";
import server from "../../src/server";
import request from "supertest";
import "jest-extended";

import {
    rolesThatCanAddorUpdateManufacturers,
    rolesThatCanManageAllManufacturers,
    rolesThatCanReadAllManufacturers,
} from "../support/role-permissions.support";
import { manufacturerA, manufacturerB, manufacturerC } from "../../prisma/seeds/models/manufacturer";
import { deleteSeedsFromDB, setSeedsInDB } from "../../prisma/seeds/scripts";
import { NewManufacturer } from "../../src/types/manufacturer.types";
import { ApiTestRoutes } from "../support/api-test-routes";
import { Role } from "@prisma/client";

describe("Gerenciando fabricantes", () => {
    const expectToBeInManufacturers = {
        id: expect.toBeString(),
        name: expect.toBeString(),
        empresaId: expect.toBeString(),
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
    };

    const newManufacturer: NewManufacturer = {
        name: "Novo Fabricante",
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    rolesThatCanReadAllManufacturers.forEach((role) =>
        it(`Deveria listar os fabricantes como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.MANUFACTURER_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ sortBy: "name", limit: 10, sortType: "asc" })
                .expect(200);

            expect(res.body.length).toBe(3);

            for (let vendedor of res.body) {
                expect(vendedor).toStrictEqual(expectToBeInManufacturers);
            }
        })
    );

    rolesThatCanReadAllManufacturers.forEach((role) =>
        it(`Deveria pegar um único fabricante como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_MANUFACTURER_ROUTE(manufacturerA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body).toStrictEqual(expectToBeInManufacturers);
            expect(res.body.id).toBe(manufacturerA.id);
            expect(res.body.name).toBe(manufacturerA.name);
        })
    );

    it("Deveria retornar um erro 404 ao pegar um único fabricante inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .get(ApiTestRoutes.PATCH_MANUFACTURER_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    rolesThatCanAddorUpdateManufacturers.forEach((role) =>
        it(`Deveria adicionar um novo fabricante como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .post(ApiTestRoutes.MANUFACTURER_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newManufacturer] })
                .expect(201);

            expect(res.body[0].name).toBe(newManufacturer.name);
        })
    );

    it("Deveria gerar erro 400 ao tentar adicionar um fabricante com nome já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .post(ApiTestRoutes.MANUFACTURER_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newManufacturer, name: manufacturerA.name }] })
            .expect(400);
    });

    rolesThatCanAddorUpdateManufacturers.forEach((role) =>
        it(`Deveria editar um fabricante como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.PATCH_MANUFACTURER_ROUTE(manufacturerA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newManufacturer })
                .expect(200);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_MANUFACTURER_ROUTE(manufacturerA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body.id).toBe(manufacturerA.id);
            expect(res.body.name).toBe(newManufacturer.name);
        })
    );

    it("Deveria gerar erro 404 ao tentar editar um fabricante inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_MANUFACTURER_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: newManufacturer })
            .expect(404);
    });

    it("Deveria gerar erro 400 ao tentar editar um fabricante com nome já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_MANUFACTURER_ROUTE(manufacturerB.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...newManufacturer, name: manufacturerA.name } })
            .expect(400);
    });

    rolesThatCanManageAllManufacturers.forEach((role) =>
        it(`Deveria deletar um fabricante ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .delete(ApiTestRoutes.MANUFACTURER_ROUTE + `/${manufacturerC.id}`)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(204);
        })
    );

    it("Deveria gerar erro 400 ao tentar deletar um fabricante relacionado a algum vendaProduto", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_MANUFACTURER_ROUTE(manufacturerA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar deletar um fabricante inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_MANUFACTURER_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });
});
