import AuthSupport from "../support/auth.support";
import server from "../../src/server";
import request from "supertest";
import "jest-extended";

import {
    rolesThatCanAddorUpdateSegment,
    rolesThatCanManageAllSegments,
    rolesThatCanReadAllSegments,
} from "../support/role-permissions.support";
import { deleteSeedsFromDB, setSeedsInDB } from "../../prisma/seeds/scripts";
import { segmentA, segmentB } from "../../prisma/seeds/models/customer";
import { ApiTestRoutes } from "../support/api-test-routes";
import { NewSegment } from "../../src/types/segment.types";
import { Role } from "@prisma/client";

describe("Gerenciando segmentos", () => {
    const expectToBeInSegments = {
        id: expect.toBeString(),
        name: expect.toBeString(),
        empresaId: expect.toBeString(),
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
    };

    const newSegment: NewSegment = {
        name: "SegmentoNovo",
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    rolesThatCanReadAllSegments.forEach((role) =>
        it(`Deveria listar os segmentos como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.SEGMENT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ sortBy: "name", limit: 10, sortType: "asc" })
                .expect(200);

            expect(res.body.length).toBe(2);

            for (let segmento of res.body) {
                expect(segmento).toStrictEqual(expectToBeInSegments);
            }
        })
    );

    rolesThatCanReadAllSegments.forEach((role) =>
        it(`Deveria pegar um único segmento como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_SEGMENT_ROUTE(segmentA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body).toStrictEqual(expectToBeInSegments);
            expect(res.body.id).toBe(segmentA.id);
            expect(res.body.name).toBe(segmentA.name);
        })
    );

    it("Deveria retornar um erro 404 ao pegar um único segmento inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .get(ApiTestRoutes.PATCH_SEGMENT_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    rolesThatCanAddorUpdateSegment.forEach((role) =>
        it(`Deveria adicionar novo segmento como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .post(ApiTestRoutes.SEGMENT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newSegment] })
                .expect(201);
        })
    );

    it("Deveria gerar erro 400 ao adicionar segmento com nome já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .post(ApiTestRoutes.SEGMENT_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newSegment, name: segmentA.name }] })
            .expect(400);
    });

    rolesThatCanAddorUpdateSegment.forEach((role) =>
        it(`Deveria editar um segmento como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.PATCH_SEGMENT_ROUTE(segmentA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newSegment })
                .expect(200);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_SEGMENT_ROUTE(segmentA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body.id).toBe(segmentA.id);
            expect(res.body.name).toBe(newSegment.name);
        })
    );

    it("Deveria gerar erro 400 ao tentar editar um segmento com nome já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_SEGMENT_ROUTE(segmentB.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...newSegment, name: segmentA.name } })
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar editar um segmento inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_SEGMENT_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: newSegment })
            .expect(404);
    });

    rolesThatCanManageAllSegments.forEach((role) =>
        it(`Deveria deletar um segmento como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .delete(ApiTestRoutes.PATCH_SEGMENT_ROUTE(segmentB.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(204);
        })
    );

    it("Deveria gerar erro 400 ao tentar deletar um segmento vinculado a cliente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .delete(ApiTestRoutes.PATCH_SEGMENT_ROUTE(segmentA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar deletar um segmento inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .delete(ApiTestRoutes.PATCH_SEGMENT_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });
});
