import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";
import { Acao, Tabela } from "@prisma/client";

import * as T from "../types/payment-method.types";

import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

export default class PaymentMethodService {
    private readonly context: RequestContext;

    constructor(context: RequestContext) {
        this.context = context;
    }

    public createMany = async (newMethods: T.NewPaymentMethod[]) => {
        await this.validateDuplicates(newMethods.map(({ name }) => name));

        const _create = prisma.formaPagamento.createManyAndReturn({
            data: newMethods.map((method) => ({ ...method, empresaId: this.context.currentUserRole.empresaId })),
        });

        const _audit = auditService.createAudit({
            data: newMethods.map((newM) => ({ id: newM.name })),
            action: Acao.CREATE,
            table: Tabela.METODO_PAGAMENTO,
            context: this.context,
        });

        const [created] = await prisma.$transaction([_create, _audit]);
        return created.slice(0, newMethods.length);
    };

    public findManyBy = async (query: FindQueryProps<T.PaymentMethodWhere, T.PaymentMethodSortBy>) => {
        const { name } = query.where ?? {};

        return await prisma.formaPagamento.findMany({
            where: {
                name: name ? { contains: name, mode: "insensitive" } : undefined,
                empresaId: this.context.currentUserRole.empresaId,
            },
            ...PrismaUtils.extractSortPageInfoFrom(query, "name", "asc"),
        });
    };

    public getOneBy = async (paymentMethodId: string) => {
        return prisma.formaPagamento.findUnique({
            where: { id: paymentMethodId, empresaId: this.context.currentUserRole.empresaId },
        });
    };

    public updateOne = async (updateProps: T.UpdatePaymentMethodProps) => {
        await this.validateIfExist(updateProps.id);
        await this.validateDuplicates([updateProps.name], updateProps.id);

        const _update = prisma.formaPagamento.update({
            where: { id: updateProps.id, empresaId: this.context.currentUserRole.empresaId },
            data: { ...updateProps },
        });

        const _audit = auditService.createAudit({
            data: [{ ...updateProps }],
            action: Acao.UPDATE,
            table: Tabela.METODO_PAGAMENTO,
            context: this.context,
        });

        await prisma.$transaction([_update, _audit]);
        return;
    };

    public deleteOneBy = async (paymentMethodId: string) => {
        await this.validateIfExist(paymentMethodId);

        const _delete = prisma.formaPagamento.delete({
            where: { id: paymentMethodId, empresaId: this.context.currentUserRole.empresaId },
        });

        const _audit = auditService.createAudit({
            data: [{ id: paymentMethodId }],
            action: Acao.DELETE,
            table: Tabela.METODO_PAGAMENTO,
            context: this.context,
        });

        await prisma.$transaction([_delete, _audit]);
        return;
    };

    private validateDuplicates = async (names: string[], paymentMethodIdUpdating?: string) => {
        const methodWithSameName = await prisma.formaPagamento.findFirst({
            where: {
                name: { in: names },
                id: { not: paymentMethodIdUpdating },
                empresaId: this.context.currentUserRole.empresaId,
            },
        });

        if (methodWithSameName)
            throw new ApiError(httpStatus.BAD_REQUEST, `O nome ${methodWithSameName.name} já está em uso!`);
    };

    private validateIfExist = async (paymentMethodId: string) => {
        const paymentMethod = await this.getOneBy(paymentMethodId);
        if (!paymentMethod) throw new ApiError(httpStatus.NOT_FOUND, "Forma de pagamento não encontrada");
    };
}
