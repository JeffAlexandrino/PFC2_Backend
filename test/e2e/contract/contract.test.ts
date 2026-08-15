import AuthSupport from "../../support/auth.support";
import ContractCases from "./contract.test-cases";
import server from "../../../src/server";
import request from "supertest";
import "jest-extended";

import { deleteSeedsFromDB, setSeedsInDB } from "../../../prisma/seeds/scripts";
import { contractA, contractB } from "../../../prisma/seeds/models/contract";
import { NewContract } from "../../../src/types/contract.type";
import { ApiTestRoutes } from "../../support/api-test-routes";
import { Role } from "@prisma/client";

describe("Gerenciando contratos", () => {
    const expectToBeInContracts = {
        id: expect.toBeString(),
        name: expect.toBeString(),
        comissaoPrimeiraParcela: expect.toBeBoolean(),
        empresaId: expect.toBeString(),
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
    };

    const newContract: NewContract = {
        name: "Contrato novo",
        comissaoPrimeiraParcela: true,
    };

    const contractWithDuplicateName: NewContract = {
        name: contractA.name,
        comissaoPrimeiraParcela: true,
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    ContractCases.permissionsCreate.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao criar contrato como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .post(ApiTestRoutes.CONTRACT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newContract] })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.length).toBe(1);
            expect(res.body[0].name).toBe(newContract.name);
            expect(res.body[0].comissaoPrimeiraParcela).toBe(newContract.comissaoPrimeiraParcela);
        })
    );

    it("Deveria gerar erro 400 ao criar contratos com mesmo nome", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .post(ApiTestRoutes.CONTRACT_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [contractWithDuplicateName] })
            .expect(400);
    });

    ContractCases.permissionsUpdate.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao editar um contrato como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.PATCH_CONTRACT_ROUTE(contractB.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newContract })
                .expect(expected.status);

            if (!expected.allowed) return;

            const resContractB = await request(server)
                .get(ApiTestRoutes.PATCH_CONTRACT_ROUTE(contractB.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(resContractB.body.name).toBe(newContract.name);
            expect(resContractB.body.comissaoPrimeiraParcela).toBe(newContract.comissaoPrimeiraParcela);
        })
    );

    it("Deveria gerar erro 400 ao editar um contrato com nome já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_CONTRACT_ROUTE(contractB.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: contractWithDuplicateName })
            .expect(400);
    });

    it("Deveria gerar erro 404 ao editar um contrato não existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_CONTRACT_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: contractWithDuplicateName })
            .expect(404);
    });

    ContractCases.permissionsRead.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao listar os contratos como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.CONTRACT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ sortBy: "createdAt", limit: 10, sortType: "desc" })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.length).toBe(2);

            for (let contrato of res.body) {
                expect(contrato).toStrictEqual(expectToBeInContracts);
            }
        })
    );

    ContractCases.permissionsRead.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao pegar um único contrato como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_CONTRACT_ROUTE(contractB.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body).toStrictEqual(expectToBeInContracts);
            expect(res.body.name).toBe(contractB.name);
            expect(res.body.id).toBe(contractB.id);
        })
    );

    it("Deveria gerar erro 404 ao não encontrar um contrato", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .get(ApiTestRoutes.PATCH_CONTRACT_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    ContractCases.permissionsDelete.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao deletar um contrato como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .delete(ApiTestRoutes.PATCH_CONTRACT_ROUTE(contractB.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);
        })
    );

    it("Deveria gerar erro 404 ao deletar um contrato inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .delete(ApiTestRoutes.PATCH_CONTRACT_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });
});
