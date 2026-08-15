import { DataToggleCommissionsDistributorPaid, QueryFindCommissions } from "../validations/commission.validator";
import { Acao, Comissao, EstadoVenda, Tabela, TipoMeta } from "@prisma/client";
import { SaleDistribution } from "../types/commission-distribution.types";
import { NewSaleInvoiceNormalized } from "../types/sale-invoice.types";
import { RequestContext } from "../middlewares/auth";
import { Calculator } from "../utils/calculator";

import * as T from "../types/commission.types";

import PrismaUtils from "../utils/prisma.utils";
import TargetService from "./target.service";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

const TOLERANCE_HOUR_PAY_AFTER_APROVED = 1;

export default class CommissionService {
    private readonly context: RequestContext;
    private readonly targetService: TargetService;

    private readonly commissionsInclude = {
        userRole: { include: { user: { omit: { password: true } } } },
        venda: {
            include: {
                cliente: true,
                accountManager: { include: { user: { omit: { password: true } } } },
                insideSales: { include: { user: { omit: { password: true } } } },

                referrer: { include: { user: { omit: { password: true } } } },
                solutionArchitect: { include: { user: { omit: { password: true } } } },
                comercialAssistant: { include: { user: { omit: { password: true } } } },
                contrato: { select: { name: true } },
            },
        },
        notaVenda: {
            include: {
                vendasProduto: { select: { id: true, fornecedores: true } },
                vendasServico: { select: { id: true } },
                comissoes: {
                    orderBy: { dataComissao: "asc" },
                    select: { id: true, dataComissao: true, comissaoPaga: true, userRoleId: true },
                } as const,
            },
        },
    };

    constructor(context: RequestContext) {
        this.context = context;
        this.targetService = new TargetService(context);
    }

    public findManyBy = async (query: QueryFindCommissions) => {
        const { comissaoPaga, codigoNota, saleInvoiceId, distributorPaid, ...restWhere } = query.where ?? {};

        const commissions = await prisma.comissao.findMany({
            where: {
                comissaoPaga: comissaoPaga === "true" ? true : comissaoPaga === "false" ? false : undefined,
                dataComissao: { lte: restWhere.lte_dataComissao, gte: restWhere.gte_dataComissao },
                updatedAt: { lte: restWhere.lte_updatedAt, gte: restWhere.gte_updatedAt },
                venda: {
                    estadoVenda: restWhere.estadoVenda,
                    clienteId: restWhere.clienteId,
                    empresaId: this.context.currentUserRole.empresaId,

                    ...(restWhere.numOportunidadeCRM && {
                        OR: [
                            { numOportunidadeCRM: restWhere.numOportunidadeCRM },
                            {
                                notasVenda: {
                                    some: {
                                        codigo: {
                                            contains: restWhere.numOportunidadeCRM,
                                            mode: "insensitive",
                                        },
                                    },
                                },
                            },
                        ],
                    }),
                },
                distributorPaid: distributorPaid === "true" ? true : distributorPaid === "false" ? false : undefined,
                notaVenda:
                    codigoNota || saleInvoiceId
                        ? { id: saleInvoiceId, codigo: { contains: codigoNota, mode: "insensitive" } }
                        : undefined,
                userRole: { empresaId: this.context.currentUserRole.empresaId, userId: restWhere.userId },
                ativo: true,
            },
            include: this.commissionsInclude,
            ...PrismaUtils.extractSortPageInfoFrom(query, "dataComissao", "desc"),
        });

        return commissions;
    };

    public getOne = async (commissionId: string) => {
        return await prisma.comissao.findUnique({
            where: {
                id: commissionId,
                venda: { empresaId: this.context.currentUserRole.empresaId },
                userRole: { empresaId: this.context.currentUserRole.empresaId },
            },
            include: this.commissionsInclude,
        });
    };

    public disableOne = async (commissionId: string) => {
        const _disableOne = prisma.comissao.update({
            where: {
                id: commissionId,
                venda: { empresaId: this.context.currentUserRole.empresaId },
                userRole: { empresaId: this.context.currentUserRole.empresaId },
            },
            data: { ativo: false },
        });
        const _audit = auditService.createAudit({
            data: [{ id: commissionId }],
            action: Acao.DELETE,
            table: Tabela.COMISSAO,
            context: this.context,
        });

        await prisma.$transaction([_disableOne, _audit]);

        return commissionId;
    };

    public async findAllIncludesIn(commissionsIds: string[], where: { userId?: string }) {
        const uniqueCommissionsIds = [...new Set(commissionsIds)];

        const commissions = await prisma.comissao.findMany({
            where: {
                id: { in: uniqueCommissionsIds },
                userRole: { empresaId: this.context.currentUserRole.empresaId, userId: where.userId },
            },
            include: this.commissionsInclude,
        });

        if (commissions.length !== uniqueCommissionsIds.length)
            throw new ApiError(httpStatus.BAD_REQUEST, "Não foi possível encontrar todas as comissões.");

        if (commissions.length === 0) throw new ApiError(httpStatus.NOT_FOUND, "Nenhuma comissão encontrada.");

        return commissions;
    }

    public payMany = async ({ comissoesId }: T.PayManyCommissionsProps) => {
        const commissions = await this.findAllIncludesIn(comissoesId, { userId: undefined });

        await this.validateIfCanBeModified(commissions);
        await this.validateIfCanBePay(commissions);

        const canChangeSaleStatus = await this.validateAllSaleCommissionsPaid(commissions);

        const _updatedCommissions = prisma.comissao.updateMany({
            where: {
                id: { in: comissoesId },
                distributorPaid: true,
                userRole: { empresaId: this.context.currentUserRole.empresaId },
                ativo: true,
                venda: { estadoVenda: { in: [EstadoVenda.AVAILABLE_PAYMENT, EstadoVenda.PAID] } },
            },
            data: { comissaoPaga: true },
        });

        const _audit = auditService.createAudit({
            data: comissoesId.map((id) => ({ id, comissaoPaga: true })),
            action: Acao.UPDATE,
            table: Tabela.COMISSAO,
            context: this.context,
        });

        await prisma.$transaction([_updatedCommissions, _audit]);

        // Se todas as comissões da venda forem pagas, o estado da venda é alterado para pago automaticamente.
        if (canChangeSaleStatus) {
            await prisma.venda.updateMany({
                where: {
                    comissoes: { some: { id: { in: comissoesId } } },
                    estadoVenda: EstadoVenda.AVAILABLE_PAYMENT,
                },
                data: {
                    estadoVenda: EstadoVenda.PAID,
                },
            });
        }
    };

    public toggleDistributorPaid = async ({ saleInvoiceId, commissionDate }: DataToggleCommissionsDistributorPaid) => {
        const commissions = await this.findManyBy({
            where: { saleInvoiceId, lte_dataComissao: commissionDate, gte_dataComissao: commissionDate },
        });
        const commissionIds = commissions.map((commission) => commission.id);

        if (commissions.length === 0)
            throw new ApiError(httpStatus.NOT_FOUND, "Não foi possível encontrar as comissões.");

        await this.validateIfCanBeModified(commissions);

        const currentDistributorPaid = commissions[0].distributorPaid ?? false;

        const _toggledDistributorPaid = prisma.comissao.updateMany({
            where: { id: { in: commissionIds } },
            data: { distributorPaid: !currentDistributorPaid },
        });

        const _audit = auditService.createAudit({
            data: commissionIds.map((id) => ({ id, distributorPaid: !currentDistributorPaid })),
            action: Acao.UPDATE,
            table: Tabela.COMISSAO,
            context: this.context,
        });

        await prisma.$transaction([_toggledDistributorPaid, _audit]);
    };

    public approveMany = async ({ comissoesId }: T.ApproveCommissionsProps) => {
        const commissions = await this.findAllIncludesIn(comissoesId, { userId: undefined });

        await this.validateIfCanBeModified(commissions);
        await this.verifyIfDistributorPaid(commissions);
        await this.verifyIfStatusSaleNotAvailablePayment(commissions);

        const userRole = commissions.map(({ userRole }) => ({
            fixedCommission: userRole.fixedCommission,
            id: userRole.id,
        }));
        const commissionsWithApprovedAtributes = await this.getCommissionWithApprovedAtributes(commissions, userRole); //

        const approvedAt = new Date();
        const _updatedCommissions = commissionsWithApprovedAtributes.map((commission) =>
            prisma.comissao.update({
                where: { id: commission.id, ativo: true },
                data: {
                    approvedAt,
                    porcentCommissionApproved: commission.porcentCommissionApproved,
                    porcentAcceleratorApproved: commission.porcentAcceleratorApproved,
                },
            })
        );

        const _audit = auditService.createAudit({
            data: comissoesId.map((id) => ({ id, approvedAt })),
            action: Acao.UPDATE,
            table: Tabela.COMISSAO,
            context: this.context,
        });

        await prisma.$transaction([..._updatedCommissions, _audit]);
    };

    public static findMatchedCommission(commission: Comissao, newCommissions: T.NewCommission[]) {
        return newCommissions.find((newCommission) => this.matchCommissions(commission, newCommission));
    }

    public static matchCommissions(commission: Comissao, newCommission: T.NewCommission) {
        const sameDate = newCommission.dataComissao.getTime() === commission.dataComissao.getTime();
        const sameSalePersonRoleId = newCommission.userRoleId === commission.userRoleId;
        return sameDate && sameSalePersonRoleId;
    }

    public getInfoPerRole = async (query: { where?: T.CommissionInfoPerUserWhere }) => {
        const commissions = await this.findManyBy({ where: { ...query.where } });

        const fixedCommission = commissions.at(0)?.userRole.fixedCommission;
        const infoPerUser: T.CommissionInfoPerUser[] = [];

        for (const commission of commissions) {
            const { totalExpected, totalApproved } = CommissionService.getCommissionValues(commission, fixedCommission);

            const infoIdx = infoPerUser.findIndex((vc) => vc.user.id === commission.userRole.userId);

            if (infoIdx !== -1) {
                infoPerUser[infoIdx].expectedValue += !commission.comissaoPaga ? totalExpected : 0;
                infoPerUser[infoIdx].approvedValue += !commission.comissaoPaga ? totalApproved : 0;
                infoPerUser[infoIdx].pago += commission.comissaoPaga ? totalApproved : 0;
                if (!commission.comissaoPaga) infoPerUser[infoIdx].comissoesIdsAPagar.push(commission.id);
            } else
                infoPerUser.push({
                    user: commission.userRole.user,
                    expectedValue: !commission.comissaoPaga ? totalExpected : 0,
                    approvedValue: !commission.comissaoPaga ? totalApproved : 0,
                    pago: commission.comissaoPaga ? totalApproved : 0,
                    comissoesIdsAPagar: !commission.comissaoPaga ? [commission.id] : [],
                });
        }
        return infoPerUser;
    };

    public static getCommissionsForNewSaleInvoiceNormalized(
        newSaleInvoiceNormalized: NewSaleInvoiceNormalized,
        commissionDistribution: SaleDistribution,
        commissionOnFirstInvoice?: boolean
    ) {
        const invoiceCalcs = Calculator.getSaleInvoicesWithCalcs([newSaleInvoiceNormalized])[0];

        const invoiceDates = commissionOnFirstInvoice
            ? [newSaleInvoiceNormalized.datasBoleto[0]]
            : newSaleInvoiceNormalized.datasBoleto;

        const marginBase = invoiceCalcs.valorMargemBruta / invoiceDates.length;

        const newCommissions: T.NewCommission[] = [];
        invoiceDates.forEach((invoiceDate) => {
            const referrerCommissions = this.createCommissionBy(
                commissionDistribution.referrerDist?.roleCommissions.map((roleCommission) => roleCommission) ?? [],
                marginBase,
                invoiceDate
            );
            const referrerCommissionsTotalValue = this.getOnlyCommissionTotalValue(referrerCommissions);

            const marginBaseForArchitects = marginBase - referrerCommissionsTotalValue;
            const architectsCommissions = this.createCommissionBy(
                commissionDistribution.architectDist?.roleCommissions.map((roleCommission) => roleCommission) ?? [],
                marginBaseForArchitects,
                invoiceDate
            );
            const architectsCommissionsTotalValue = this.getOnlyCommissionTotalValue(architectsCommissions);

            const marginBaseForAssistants = marginBaseForArchitects - architectsCommissionsTotalValue;
            const assistantsCommissions = this.createCommissionBy(
                commissionDistribution.comercialAssistantDist?.roleCommissions.map(
                    (roleCommission) => roleCommission
                ) ?? [],
                marginBaseForAssistants,
                invoiceDate
            );
            const assistantsCommissionsTotalValue = this.getOnlyCommissionTotalValue(assistantsCommissions);

            const marginBaseForSalePeopleAndManagers = marginBaseForAssistants - assistantsCommissionsTotalValue;

            const salePeopleAndManagerRoleCommissions = [
                commissionDistribution.comercialManagerDist,
                commissionDistribution.salePersonDist,
            ].flatMap((dist) => dist?.roleCommissions ?? []);

            const salePeopleAndManagersCommissions = this.createCommissionBy(
                salePeopleAndManagerRoleCommissions,
                marginBaseForSalePeopleAndManagers,
                invoiceDate
            );

            newCommissions.push(
                ...referrerCommissions,
                ...architectsCommissions,
                ...assistantsCommissions,
                ...salePeopleAndManagersCommissions
            );
        });

        return newCommissions;
    }

    private static createCommissionBy(
        distributions: { userRoleId: string; comissao: number; acelerator?: number | null }[],
        commissionMarginBase: number,
        commissionDate: Date
    ): T.NewCommission[] {
        return distributions.map((distribution) => ({
            valorMargemBrutaBase: commissionMarginBase,
            dataComissao: commissionDate,
            userRoleId: distribution.userRoleId,
            comissao: distribution.comissao,
            acelerador: distribution.acelerator ?? 0,
            comissaoPaga: false,
        }));
    }

    private static getOnlyCommissionTotalValue(commissions: T.NewCommission[]) {
        return commissions.reduce(
            (acc, commission) => acc + (commission.valorMargemBrutaBase * commission.comissao) / 100,
            0
        );
    }

    private async validateIfCanBeModified(commissions: T.UpdateCommissionProps[]) {
        const paidCommission = commissions.some((commission) => commission.comissaoPaga);
        if (paidCommission) throw new ApiError(httpStatus.BAD_REQUEST, "Comissões pagas não podem ser modificadas.");
    }

    private validateIfCanBePay = async (commissions: T.CommissionWithSale[]) => {
        await this.verifyIfDistributorPaid(commissions);
        await this.verifyIfStatusSaleNotAvailablePayment(commissions);

        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() - TOLERANCE_HOUR_PAY_AFTER_APROVED);

        const commissionNotApprovedOrOutDated = commissions.filter(
            (commission) => !commission.approvedAt || commission.approvedAt <= currentDate
        );

        if (commissionNotApprovedOrOutDated.length > 0) {
            await this.returnExpiredApproval(commissionNotApprovedOrOutDated, currentDate);
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `As comissões devem ser aprovadas com no máximo ${TOLERANCE_HOUR_PAY_AFTER_APROVED} hora de antecedência antes de serem pagas.`
            );
        }
    };

    private validateAllSaleCommissionsPaid = async (commissions: T.CommissionWithSale[]) => {
        const vendasIds = commissions.map(({ venda }) => venda.id);

        const saleNotPaid = await prisma.venda.findFirst({
            where: {
                id: { in: vendasIds },
                estadoVenda: { in: [EstadoVenda.AVAILABLE_PAYMENT, EstadoVenda.PAID] },
                comissoes: { some: { comissaoPaga: false, id: { notIn: commissions.map((c) => c.id) }, ativo: true } },
            },
        });

        if (saleNotPaid != null) {
            return false;
        }
        return true;
    };

    private async getCommissionWithApprovedAtributes<T extends Pick<Comissao, "dataComissao" | "userRoleId">>(
        commissions: T[],
        userRole: { fixedCommission: boolean; id: string }[]
    ): Promise<(T & { porcentCommissionApproved: number; porcentAcceleratorApproved: number })[]> {
        const _targetInfoPerCommission = commissions.map((commission) => {
            return this.targetService.findManyForCommission(commission);
        }, []);
        const targetInfoPerCommission = await Promise.all(_targetInfoPerCommission);
        const fixedPorcentValue = 100;
        return commissions.map((commission, index) => {
            const targetsInfo = targetInfoPerCommission[index];

            const fixedCommission = userRole.find((fc) => fc.id === commission.userRoleId)?.fixedCommission ?? false;

            const { aceleratorTriggerValue, commissionTriggerValue, achieved } = targetsInfo.reduce(
                (acc, target) => {
                    const targetRevenueType = target.tiposMeta.find((type) => type.tipoMeta === TipoMeta.FATURAMENTO);
                    if (!targetRevenueType) return acc;

                    return {
                        achieved: acc.achieved + targetRevenueType.valorAtingido,
                        aceleratorTriggerValue: acc.aceleratorTriggerValue + targetRevenueType.aceleratorTriggerValue,
                        commissionTriggerValue: acc.commissionTriggerValue + targetRevenueType.commissionTriggerValue,
                    };
                },
                { aceleratorTriggerValue: 0, commissionTriggerValue: 0, achieved: 0 } as {
                    aceleratorTriggerValue: number;
                    commissionTriggerValue: number;
                    achieved: number;
                }
            );
            const notFixedCommissionValue = (fixedPorcentValue * achieved) / aceleratorTriggerValue;
            return {
                ...commission,
                porcentAcceleratorApproved: aceleratorTriggerValue > 0 && achieved >= aceleratorTriggerValue ? 100 : 0,
                porcentCommissionApproved:
                    achieved < commissionTriggerValue
                        ? 0
                        : achieved > aceleratorTriggerValue || aceleratorTriggerValue === 0
                          ? fixedPorcentValue
                          : fixedCommission
                            ? fixedPorcentValue
                            : notFixedCommissionValue,
            };
        });
    }

    public static getCommissionValues = (commission: Comissao, fixedCommission?: boolean) => {
        const porcentfixedCommisison = !fixedCommission
            ? commission.porcentCommissionApproved
            : commission.porcentCommissionApproved > 0
              ? 100
              : 0;

        let approvedCommission =
            commission.porcentCommissionApproved === null ? 0 : (porcentfixedCommisison * commission.comissao) / 100;
        const approvedAccelerator =
            commission.porcentAcceleratorApproved === null
                ? 0
                : (commission.porcentAcceleratorApproved * commission.acelerador) / 100;

        const expectedCommissionValue = (commission.comissao * commission.valorMargemBrutaBase) / 100;
        const expectedAceleratorValue = (commission.acelerador * commission.valorMargemBrutaBase) / 100;
        const totalExpected = expectedCommissionValue + expectedAceleratorValue;

        const approvedCommissionValue = (approvedCommission * commission.valorMargemBrutaBase) / 100; //Commission based on performance or 100%
        const approvedAceleratorValue = (approvedAccelerator * commission.valorMargemBrutaBase) / 100;
        const totalApproved = approvedCommissionValue + approvedAceleratorValue;

        return { totalExpected, totalApproved, approvedCommission, approvedAccelerator };
    };

    private async verifyIfDistributorPaid(comissoes: Comissao[]) {
        if (comissoes.some((c) => !c.distributorPaid))
            throw new ApiError(httpStatus.BAD_REQUEST, "Comissões devem ser pagas pelo Distribuidor");
    }

    private async verifyIfStatusSaleNotAvailablePayment(commissions: T.CommissionWithSale[]) {
        const salesNotAvailable = commissions.filter(
            (c) => c.venda.estadoVenda !== EstadoVenda.AVAILABLE_PAYMENT && c.venda.estadoVenda !== EstadoVenda.PAID
        );

        if (salesNotAvailable.length > 0)
            throw new ApiError(
                httpStatus.UNAUTHORIZED,
                "Comissões devem ter Estado de Venda como Disponível para Pagamento ou Pago"
            );
    }

    private async returnExpiredApproval(commissions: T.CommissionWithSale[], currentDate: Date) {
        const saleHasAnotherCommissionPaid = commissions.some(
            (c) => c.comissaoPaga && c.venda.estadoVenda === EstadoVenda.AVAILABLE_PAYMENT
        );
        const commissionIds = commissions.map((c) => c.id);

        // const salePaid = await prisma.venda.findFirst({
        //     where: {
        //         estadoVenda: EstadoVenda.AVAILABLE_PAYMENT,
        //         comissoes: { some: { comissaoPaga: true, id: { notIn: commissionIds } } },
        //     },
        // });

        if (!saleHasAnotherCommissionPaid) {
            await prisma.venda.updateManyAndReturn({
                where: {
                    comissoes: {
                        some: { id: { in: commissionIds }, comissaoPaga: false, ativo: true, distributorPaid: true },
                    },
                },
                data: {
                    estadoVenda: EstadoVenda.FINANCIAL_AUDIT,
                    updatedAt: currentDate,
                },
            });
        }

        const _updates = commissionIds.map((commission) =>
            prisma.comissao.update({
                where: { id: commission, comissaoPaga: false, ativo: true, distributorPaid: true },
                data: {
                    approvedAt: null,
                    porcentCommissionApproved: undefined,
                    porcentAcceleratorApproved: undefined,
                    updatedAt: currentDate,
                },
            })
        );

        const _audit = auditService.createAudit({
            action: Acao.UPDATE,
            table: Tabela.COMISSAO,
            data: commissionIds.map((c) => ({ id: c, revertedApproval: true })),
            context: this.context,
        });

        await prisma.$transaction([..._updates, _audit]);
    }
}
