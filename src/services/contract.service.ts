import {
    ContractSortBy,
    ContractWhere,
    UpdateContractProps,
    NewContract,
    ContractInfoMappedByContractId,
} from "../types/contract.type";
import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";
import { Acao, Tabela } from "@prisma/client";

import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

export default class ContractService {
    private readonly context: RequestContext;

    constructor(context: RequestContext) {
        this.context = context;
    }

    public createMany = async (newContracts: NewContract[]) => {
        await this.validateDuplications(newContracts.map(({ name }) => name));

        const _created = prisma.contrato.createManyAndReturn({
            data: newContracts.map((contract) => ({ ...contract, empresaId: this.context.currentUserRole.empresaId })),
        });

        const _audit = auditService.createAudit({
            data: newContracts.map((newC) => ({ id: newC.name, ...newC })),
            action: Acao.CREATE,
            table: Tabela.CONTRATO,
            context: this.context,
        });

        const [created] = await prisma.$transaction([_created, _audit]);
        return created.slice(0, newContracts.length);
    };

    public findManyBy = async (query: FindQueryProps<ContractWhere, ContractSortBy>) => {
        const { name } = query.where ?? {};

        return await prisma.contrato.findMany({
            where: {
                name: name ? { contains: name, mode: "insensitive" } : undefined,
                empresaId: this.context.currentUserRole.empresaId,
            },
            ...PrismaUtils.extractSortPageInfoFrom(query, "name", "asc"),
        });
    };

    public getOneBy = async (contractId: string) => {
        return prisma.contrato.findUnique({
            where: { id: contractId, empresaId: this.context.currentUserRole.empresaId },
        });
    };

    public updateOne = async (updateProps: UpdateContractProps) => {
        await this.validateIfContractExist(updateProps.id);
        await this.validateDuplications([updateProps.name], updateProps.id);

        const _update = prisma.contrato.update({
            where: { id: updateProps.id, empresaId: this.context.currentUserRole.empresaId },
            data: { ...updateProps },
        });

        const _audit = auditService.createAudit({
            data: [{ ...updateProps }],
            action: Acao.UPDATE,
            table: Tabela.CONTRATO,
            context: this.context,
        });

        await prisma.$transaction([_update, _audit]);
        return;
    };

    public deleteOne = async (contractId: string) => {
        await this.validateIfContractExist(contractId);

        const _deleted = prisma.contrato.delete({
            where: { id: contractId, empresaId: this.context.currentUserRole.empresaId },
        });

        const _audit = auditService.createAudit({
            data: [{ id: contractId }],
            action: Acao.DELETE,
            table: Tabela.CONTRATO,
            context: this.context,
        });

        await prisma.$transaction([_deleted, _audit]);
        return;
    };

    private validateIfContractExist = async (contractId: string) => {
        const contract = await this.getOneBy(contractId);
        if (!contract) throw new ApiError(httpStatus.NOT_FOUND, "Contrato não encontrado.");
    };

    private validateDuplications = async (names: string[], contractIdToUpdate?: string) => {
        const contractWithSameName = await prisma.contrato.findFirst({
            where: {
                empresaId: this.context.currentUserRole.empresaId,
                name: { in: names },
                id: { not: contractIdToUpdate },
            },
        });

        if (contractWithSameName)
            throw new ApiError(httpStatus.BAD_REQUEST, `O nome ${contractWithSameName.name} já está em uso!`);
    };

    public async getContractsInfoMappedByContractId(contractIds: string[]) {
        const contractsInfo = await prisma.contrato.findMany({
            where: { empresaId: this.context.currentUserRole.empresaId, id: { in: contractIds } },
        });

        const someContractNotFounded = contractIds.some((contractId) =>
            contractsInfo.every(({ id }) => id !== contractId)
        );
        if (someContractNotFounded) throw new ApiError(httpStatus.NOT_FOUND, "Contrato não encontrado.");

        return contractsInfo.reduce((acc, { id, ...restContract }) => {
            return { ...acc, [id]: { ...restContract, id } };
        }, {} as ContractInfoMappedByContractId);
    }
}
