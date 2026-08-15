import {
    NewSalesInvoiceNormalizedWithCommissionsMappedBySaleId,
    SaleInvoice,
    SaleInvoiceEditData,
    NewSaleInvoiceNormalized,
    NewSaleInvoice,
    NewSaleInvoiceNormalizedWithCommissions,
} from "../types/sale-invoice.types";
import {
    DataCreateSale,
    DataUpdateSale,
    QueryDeleteSale,
    QueryFindSales,
    QueryGetSale,
    QueryUpdateSale,
} from "../validations/sale.validator";
import { NewSaleWithUsersInvoicesAndContractId, SaleUserRolesParams, NewSaleWithId } from "../types/sale.types";
import { Acao, EstadoVenda, Role, Tabela } from "@prisma/client";
import { NewCommission } from "../types/commission.types";
import { IntervalDateType } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";
import { Calculator } from "../utils/calculator";
import { randomUUID } from "crypto";

import CommissionDistributionService from "./commission-distribution.service";
import CommissionService from "./commission.service";
import UserRoleService from "./user-role.service";
import ContractService from "./contract.service";
import PrismaUtils from "../utils/prisma.utils";
import ServiceService from "./service.service";
import ProductService from "./product.service";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import EmailService from "./email.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";
import CustomerService from "./customer.service";

export default class SaleService {
    private readonly context: RequestContext;

    private readonly distributionService: CommissionDistributionService;
    private readonly userRoleService: UserRoleService;
    private readonly contractService: ContractService;
    private readonly productService: ProductService;
    private readonly serviceService: ServiceService;

    private readonly saleIncludes = {
        cliente: true,
        accountManager: { include: { user: { omit: { password: true } } } },
        insideSales: { include: { user: { omit: { password: true } } } },
        comercialManager: { include: { user: { omit: { password: true } } } },
        comercialAssistant: { include: { user: { omit: { password: true } } } },
        solutionArchitect: { include: { user: { omit: { password: true } } } },
        referrer: { include: { user: { omit: { password: true } } } },
        contrato: true,
        notasVenda: {
            include: {
                comissoes: { orderBy: { dataComissao: "asc" } },
                formaPagamento: true,
                datasBoleto: { orderBy: { data: "asc" } },
                vendasProduto: { include: { produto: { include: { categoria: true } }, fornecedores: true } },
                vendasServico: { include: { servico: true } },
            },
        },
    } as const;

    public constructor(context: RequestContext) {
        this.context = context;

        this.distributionService = new CommissionDistributionService(context);
        this.contractService = new ContractService(context);
        this.productService = new ProductService(context);
        this.serviceService = new ServiceService(context);
        this.userRoleService = new UserRoleService(context);
    }

    public static getUserRoleSaleWhere(where: SaleUserRolesParams) {
        return {
            comercialAssistantId:
                where.comercialAssistantId ?? (where.role === Role.COMERCIAL_ASSISTANT ? { not: null } : undefined),
            comercialManagerId:
                where.comercialManagerId ?? (where.role === Role.COMERCIAL_MANAGER ? { not: null } : undefined),
            solutionArchitectId:
                where.solutionArchitectId ?? (where.role === Role.SOLUTION_ARCHITECT ? { not: null } : undefined),
            referrerId: where.referrerId ?? (where.role === Role.REFERRER ? { not: null } : undefined),
        };
    }

    public static getAccountManagerOrIS(where: SaleUserRolesParams) {
        const AM = { accountManagerId: where.accountManagerId ?? where.salePersonId };
        let IS = { insideSalesId: AM.accountManagerId };
        AM.accountManagerId ? (IS = { insideSalesId: undefined }) : (IS = { insideSalesId: where.salePersonId });
        return {
            accountManagerId: AM.accountManagerId,
            insideSalesId: IS.insideSalesId,
        };
    }

    public async findManyBy(query: QueryFindSales) {
        const { gte_dataFaturamento, lte_dataFaturamento, vendaRenovacao, ...where } = query.where ?? {};

        const sales = await prisma.venda.findMany({
            where: {
                ...SaleService.getUserRoleSaleWhere(where),
                ...SaleService.getAccountManagerOrIS(where),
                empresaId: this.context.currentUserRole.empresaId,
                clienteId: where.clienteId,
                estadoVenda: where.estadoVenda,
                contratoId: where.contratoId,
                vendaRenovacao: vendaRenovacao === "true" ? true : vendaRenovacao === "false" ? false : undefined,
                dataVenda: { gte: where.gte_dataVenda, lte: where.lte_dataVenda },
                updatedAt: { gte: where.gte_updatedAt, lte: where.lte_updatedAt },

                OR: [
                    //TODO: Remover esse OR apos migrar os dados para a Nota, só pode ter 1 OR por função
                    {
                        numPedidoDistribuidor: where.numPedidoDistribuidor
                            ? { contains: where.numPedidoDistribuidor, mode: "insensitive" }
                            : undefined,
                        numOportunidadeCRM: where.numOportunidadeCRM
                            ? { contains: where.numOportunidadeCRM, mode: "insensitive" }
                            : undefined,
                    },
                    {
                        notasVenda: {
                            some: {
                                numPedidoDistribuidor: where.numPedidoDistribuidor
                                    ? { contains: where.numPedidoDistribuidor, mode: "insensitive" }
                                    : undefined,
                                numOportunidadeCRM: where.numOportunidadeCRM
                                    ? { contains: where.numOportunidadeCRM, mode: "insensitive" }
                                    : undefined,
                            },
                        },
                    },
                ],

                notasVenda: {
                    some: {
                        formaPagamentoId: where.formaPagamentoId,
                        dataFaturamento: { gte: gte_dataFaturamento, lte: lte_dataFaturamento },
                        codigo: { contains: where.codigoNota, mode: "insensitive" },
                        datasBoleto: {
                            some: { data: { gte: where.gte_invoiceDate, lte: where.lte_invoiceDate } },
                        },
                    },
                },
            },
            include: this.saleIncludes,
            ...PrismaUtils.extractSortPageInfoFrom(query, "dataVenda", "desc"),
        });
        return Calculator.getSalesWithCalcs(sales);
    }

    public findAllSalesByUserRoles = async (userRoles: string[], intervalDate?: IntervalDateType) => {
        const sales = await prisma.venda.findMany({
            where: {
                OR: [
                    { comercialAssistantId: { in: userRoles } },
                    { comercialManagerId: { in: userRoles } },
                    { solutionArchitectId: { in: userRoles } },
                    { referrerId: { in: userRoles } },
                    { accountManagerId: { in: userRoles } },
                    { insideSalesId: { in: userRoles } },
                ],
                dataVenda: {
                    gte: intervalDate?.startDate,
                    lte: intervalDate?.endDate,
                },
            },
            select: {
                comercialAssistant: true,
                accountManager: true,
                comercialManager: true,
                solutionArchitect: true,
                referrer: true,
                insideSales: true,
                dataVenda: true,
                cliente: { select: { name: true } },
                estadoVenda: true,
                notasVenda: { include: { vendasProduto: true, vendasServico: true } },
            },
        });

        return Calculator.getSalesWithCalcs(sales);
    };

    public findAllIncludesIn = async (salesIds: string[], where: { clienteId?: string }) => {
        const uniqueSalesIds = [...new Set(salesIds)];

        const sales = await prisma.venda.findMany({
            where: {
                id: { in: uniqueSalesIds },
                clienteId: where.clienteId,
            },
            include: this.saleIncludes,
        });

        if (sales.length !== uniqueSalesIds.length)
            throw new ApiError(httpStatus.BAD_REQUEST, "Não foi possível encontrar todas as vendas.");

        return sales;
    };

    public async createMany(newSales: DataCreateSale[]) {
        await this.validateIfCanBeCreated(newSales);
        const newSalesWithIds = this.getNewSalesWithIds(newSales);
        const invoicesWithCommissionsMappedBySaleId =
            await this.getNewInvoicesNormalizedWithCommissionsMappedBySaleId(newSalesWithIds);

        const _createdSalesRecords = newSalesWithIds.map(({ notasVenda, ...newSaleWithId }) =>
            prisma.venda.create({ data: { ...newSaleWithId } })
        );

        const _createdSaleInvoices = newSalesWithIds.flatMap(({ id: saleId }) => {
            const saleInvoicesWithCommissions = invoicesWithCommissionsMappedBySaleId[saleId];
            return saleInvoicesWithCommissions.map(
                ({ vendasProduto, vendasServico, datasBoleto, comissoes, ...saleInvoice }) =>
                    prisma.notaVenda.create({
                        data: {
                            ...saleInvoice,
                            id: undefined,
                            vendaId: saleId,
                            vendasProduto: {
                                create: vendasProduto.map(({ fornecedoresId, ...productSale }) => ({
                                    ...productSale,
                                    id: undefined,
                                    fornecedores: { connect: fornecedoresId.map((id) => ({ id })) },
                                })),
                            },
                            vendasServico: {
                                create: vendasServico.map(({ tipoMoeda, ...serviceSale }) => ({
                                    ...serviceSale,
                                    id: undefined,
                                    cotacao: tipoMoeda === "BRL" ? 1 : serviceSale.cotacao,
                                })),
                            },
                            datasBoleto: {
                                create: datasBoleto.map((data) => ({ data })),
                            },
                            comissoes: {
                                create: comissoes.map((commission) => ({
                                    ...commission,
                                    id: undefined,
                                    vendaId: saleId,
                                })),
                            },
                        },
                    })
            );
        });

        const _audit = auditService.createAudit({
            action: Acao.CREATE,
            table: Tabela.VENDA,
            data: newSalesWithIds.map((newSale) => {
                const saleInvoicesWithCommissions = invoicesWithCommissionsMappedBySaleId[newSale.id];
                return {
                    ...newSale,
                    notasVenda: saleInvoicesWithCommissions.map(({ vendasServico, comissoes, ...saleInvoice }) => ({
                        ...saleInvoice,
                        vendasServico: vendasServico.map(({ tipoMoeda, ...serviceSale }) => ({
                            ...serviceSale,
                            cotacao: tipoMoeda === "BRL" ? 1 : serviceSale.cotacao,
                        })),
                    })),
                };
            }),
            context: this.context,
        });

        let foo: CustomerService = new CustomerService(this.context);
        await foo.updateComprouWhenSaleIsPaid(newSalesWithIds.at(0)!.clienteId);

        const [createdSales, createdSaleInvoices, _] = await prisma.$transaction([
            ..._createdSalesRecords,
            ..._createdSaleInvoices,
            _audit,
        ]);
        return [createdSales, createdSaleInvoices];
    }

    public async updateOne(
        saleId: string,
        dataUpdate: DataUpdateSale,
        query?: QueryUpdateSale,
        reasonRegression?: string
    ) {
        const { notasVenda, ...restSaleEditData } = dataUpdate;

        const saleToUpdate = await this.validateIfCanBeUpdated(saleId, dataUpdate, query);

        const saleInvoicesIds: string[] = [];
        const saleInvoicesIdsWithoutPaidCommissions: string[] = [];

        saleToUpdate.notasVenda.forEach((saleInvoice) => {
            saleInvoicesIds.push(saleInvoice.id);

            if (saleInvoice.comissoes.every(({ comissaoPaga }) => !comissaoPaga))
                saleInvoicesIdsWithoutPaidCommissions.push(saleInvoice.id);
        });

        const newInvoicesWithCommissionsMappedBySaleId =
            await this.getNewInvoicesNormalizedWithCommissionsMappedBySaleId([{ id: saleId, ...dataUpdate }]);
        const newInvoicesWithCommissions = newInvoicesWithCommissionsMappedBySaleId[saleId];

        const saleInvoicesToUpdate: SaleInvoiceEditData[] = [];
        const saleInvoicesToAdd: NewSaleInvoiceNormalizedWithCommissions[] = [];

        newInvoicesWithCommissions.forEach((newInvoice) => {
            const oldMatchedSaleInvoice = saleToUpdate.notasVenda.find((oldSaleInvoice) =>
                this.matchInvoices(oldSaleInvoice, newInvoice)
            );
            if (oldMatchedSaleInvoice && oldMatchedSaleInvoice.comissoes.some(({ comissaoPaga }) => comissaoPaga))
                saleInvoicesToUpdate.push(this.prepareOldSaleInvoiceToUpdate(oldMatchedSaleInvoice, newInvoice));
            else saleInvoicesToAdd.push(newInvoice);
        });

        const _deletedSaleProducts = prisma.vendaProduto.deleteMany({
            where: { notaVendaId: { in: saleInvoicesIds } },
        });
        const _deletedSalesServices = prisma.vendaServico.deleteMany({
            where: { notaVendaId: { in: saleInvoicesIds } },
        });
        const _deletedUnpaidCommissions = prisma.comissao.deleteMany({
            where: { notaVendaId: { in: saleInvoicesIds }, comissaoPaga: false },
        });
        const _deletedInvoiceDates = prisma.dataBoleto.deleteMany({
            where: { notaVendaId: { in: saleInvoicesIds } },
        });
        const _deletedSaleInvoices = prisma.notaVenda.deleteMany({
            where: { id: { in: saleInvoicesIdsWithoutPaidCommissions } },
        });

        const _updatedSale = prisma.venda.update({
            where: { id: saleId },
            data: { ...restSaleEditData },
        });

        const _createdNewSaleInvocoices = saleInvoicesToAdd.map(
            ({ vendasProduto, vendasServico, datasBoleto, comissoes, ...saleInvoice }) =>
                prisma.notaVenda.create({
                    data: {
                        ...saleInvoice,
                        id: undefined,
                        vendaId: saleId,
                        vendasProduto: {
                            create: vendasProduto.map(({ fornecedoresId, ...productSale }) => ({
                                ...productSale,
                                id: undefined,
                                fornecedores: { connect: fornecedoresId.map((id) => ({ id })) },
                            })),
                        },
                        vendasServico: {
                            create: vendasServico.map((serviceSale) => ({
                                ...serviceSale,
                                id: undefined,
                                cotacao: serviceSale.tipoMoeda === "BRL" ? 1 : serviceSale.cotacao,
                            })),
                        },
                        datasBoleto: {
                            create: datasBoleto.map((invoiceDate) => ({ data: invoiceDate })),
                        },
                        comissoes: {
                            create: comissoes.map((commission) => ({
                                ...commission,
                                id: undefined,
                                vendaId: saleId,
                            })),
                        },
                    },
                })
        );

        const _updatedSaleInvoices = saleInvoicesToUpdate.map(
            ({ vendasProduto, vendasServico, datasBoleto, comissoes: comissoesNaoPagas, id, ...saleInvoice }) =>
                prisma.notaVenda.update({
                    where: { id },
                    data: {
                        ...saleInvoice,
                        vendaId: saleId,
                        vendasProduto: {
                            create: vendasProduto.map(({ fornecedoresId, ...productSale }) => ({
                                ...productSale,
                                id: undefined,
                                fornecedores: { connect: fornecedoresId.map((id) => ({ id })) },
                            })),
                        },
                        vendasServico: {
                            create: vendasServico.map((serviceSale) => ({
                                ...serviceSale,
                                id: undefined,
                                cotacao: serviceSale.tipoMoeda === "BRL" ? 1 : serviceSale.cotacao,
                            })),
                        },
                        datasBoleto: {
                            create: datasBoleto.map((invoiceDate) => ({ data: invoiceDate })),
                        },
                        comissoes: {
                            create: comissoesNaoPagas.map((commission) => ({
                                ...commission,
                                id: undefined,
                                vendaId: saleId,
                            })),
                        },
                    },
                })
        );

        const auditData = {
            id: saleId,
            ...dataUpdate,
            notasVenda: [...saleInvoicesToAdd, ...saleInvoicesToUpdate].map(
                ({ vendasServico, comissoes, ...saleInvoice }) => ({
                    ...saleInvoice,
                    vendasServico: vendasServico.map(({ tipoMoeda, ...serviceSale }) => ({
                        ...serviceSale,
                        cotacao: tipoMoeda === "BRL" ? 1 : serviceSale.cotacao,
                    })),
                })
            ),
        };
        const _audit = auditService.createAudit({
            action: Acao.UPDATE,
            table: Tabela.VENDA,
            data: [auditData],
            context: this.context,
        });

        const results = await prisma.$transaction([
            _deletedSaleProducts,
            _deletedSalesServices,
            _deletedUnpaidCommissions,
            _deletedInvoiceDates,
            _deletedSaleInvoices,
            _updatedSale,
            ..._createdNewSaleInvocoices,
            ..._updatedSaleInvoices,
            _audit,
        ]);

        const updatedSale = results[5];
        const createdNewSaleInvoices = results[6];
        //const updatedSaleInvoices = results[7];
        const countUpdatedSale = { count: 1 };

        await this.sendEmailsIfSaleStatusChanged(dataUpdate, saleToUpdate.estadoVenda, reasonRegression);

        return [updatedSale, createdNewSaleInvoices, countUpdatedSale];
    }

    public async getOneBy(saleId: string, query?: QueryGetSale) {
        const sale = await prisma.venda.findUnique({
            where: {
                empresaId: this.context.currentUserRole.empresaId,
                accountManagerId: query?.accountManagerIdAtual,
                insideSalesId: query?.insideSalesIdAtual,
                estadoVenda: query?.estadoVendaAtual,
                id: saleId,
            },
            include: this.saleIncludes,
        });

        if (!sale) return sale;

        return Calculator.getSalesWithCalcs([sale])[0];
    }

    public async deleteOneBy(saleId: string, query?: QueryDeleteSale) {
        const saleToDelete = await this.validateIfCanBeDeleted(saleId, query);

        const _deletedSale = prisma.venda.delete({
            where: { id: saleId, empresaId: this.context.currentUserRole.empresaId },
        });

        const _audit = auditService.createAudit({
            data: [saleToDelete],
            action: Acao.DELETE,
            table: Tabela.VENDA,
            context: this.context,
        });

        await prisma.$transaction([_deletedSale, _audit]);
        return;
    }

    private getNewSalesWithIds(newSales: DataCreateSale[]): NewSaleWithId[] {
        return newSales.map((sale) => ({
            ...sale,
            id: randomUUID(),
            empresaId: this.context.currentUserRole.empresaId,
        }));
    }

    private async getNewInvoicesNormalizedWithCommissionsMappedBySaleId(
        newSales: NewSaleWithUsersInvoicesAndContractId[]
    ) {
        const commissionDistributionsMappedBySaleId = await this.distributionService.getManyMappedBySaleId(newSales);

        const serviceIds = newSales.flatMap(({ notasVenda }) =>
            notasVenda.flatMap(({ vendasServico }) => vendasServico.map(({ servicoId }) => servicoId))
        );
        const servicesInfoMappedByServiceId = await this.serviceService.getServicesInfoMappedByServiceId(serviceIds);

        const contractIds = newSales.map(({ contratoId }) => contratoId).filter((id) => id !== null);
        const contractInfoMappedByContractId =
            await this.contractService.getContractsInfoMappedByContractId(contractIds);

        return newSales.reduce((acc, newSale) => {
            const contractInfo = newSale.contratoId ? contractInfoMappedByContractId[newSale.contratoId] : null;

            const newInvoicesNormalizedWithCommissions = newSale.notasVenda.map((invoice) => {
                const newSaleInvoiceNormalized: NewSaleInvoiceNormalized = {
                    ...invoice,
                    vendasServico: invoice.vendasServico.map((saleService) => ({
                        ...saleService,
                        tipoMoeda: servicesInfoMappedByServiceId[saleService.servicoId].tipoMoeda,
                        valorCustoHora: servicesInfoMappedByServiceId[saleService.servicoId].valorCustoHora,
                    })),
                };
                const commissions: NewCommission[] = CommissionService.getCommissionsForNewSaleInvoiceNormalized(
                    newSaleInvoiceNormalized,
                    commissionDistributionsMappedBySaleId[newSale.id],
                    contractInfo ? contractInfo.comissaoPrimeiraParcela : false
                );
                return { ...newSaleInvoiceNormalized, comissoes: commissions };
            });
            return { ...acc, [newSale.id]: newInvoicesNormalizedWithCommissions };
        }, {} as NewSalesInvoiceNormalizedWithCommissionsMappedBySaleId);
    }

    private prepareOldSaleInvoiceToUpdate(
        oldInvoice: SaleInvoice,
        newInvoice: NewSaleInvoiceNormalizedWithCommissions
    ): SaleInvoiceEditData {
        const oldCommissionsPaid = oldInvoice.comissoes.filter(({ comissaoPaga }) => comissaoPaga);
        const newCommissions = newInvoice.comissoes.filter((newCommission) =>
            oldCommissionsPaid.every(
                (oldCommission) => !CommissionService.matchCommissions(oldCommission, newCommission)
            )
        );

        return {
            id: oldInvoice.id,
            codigo: oldInvoice.codigo,
            formaParcelamento: newInvoice.formaParcelamento,
            formaPagamentoId: newInvoice.formaPagamentoId,
            vendasProduto: newInvoice.vendasProduto,
            vendasServico: newInvoice.vendasServico,
            datasBoleto: newInvoice.datasBoleto,
            comissoes: newCommissions,
        };
    }

    private findMatchedNewInvoice(
        oldInvoice: SaleInvoice,
        newInvoices: NewSaleInvoiceNormalizedWithCommissions[]
    ): NewSaleInvoiceNormalizedWithCommissions | undefined {
        const oldPaidCommissions = oldInvoice.comissoes.filter(({ comissaoPaga }) => comissaoPaga);

        return newInvoices.find((newInvoice) => {
            const sameInvoiceCode = newInvoice.codigo === oldInvoice.codigo;
            const sameRevenueDate = newInvoice.dataFaturamento.getTime() === oldInvoice.dataFaturamento.getTime();
            const allCommissionsPreserved = oldPaidCommissions.every((oldCommission) => {
                const matchedCommission = CommissionService.findMatchedCommission(oldCommission, newInvoice.comissoes);
                return !!matchedCommission;
            });
            return sameInvoiceCode && sameRevenueDate && allCommissionsPreserved;
        });
    }

    private matchInvoices(oldInvoice: SaleInvoice, newInvoice: NewSaleInvoiceNormalizedWithCommissions) {
        const oldPaidCommissions = oldInvoice.comissoes.filter(({ comissaoPaga }) => comissaoPaga);

        const sameInvoiceCode = oldInvoice.codigo === newInvoice.codigo;
        const sameRevenueDate = oldInvoice.dataFaturamento.getTime() === newInvoice.dataFaturamento.getTime();
        const allCommissionsPreserved = oldPaidCommissions.every((oldCommission) => {
            const matchedCommission = CommissionService.findMatchedCommission(oldCommission, newInvoice.comissoes);
            return !!matchedCommission;
        });
        return sameInvoiceCode && sameRevenueDate && allCommissionsPreserved;
    }

    private async validateIfCanBeCreated(sales: DataCreateSale[]) {
        const saleInvoices = sales.flatMap(({ notasVenda }) => notasVenda); //TODO: Check Opt
        const productsIds = saleInvoices.flatMap(({ vendasProduto }) =>
            vendasProduto.map(({ produtoId }) => produtoId)
        );

        // Preserve business-priority errors: invalid user roles should fail before duplicate checks.
        await this.validateIfUserRolesExists(sales);

        const validatePromises = [
            ...sales.map(({ notasVenda }) =>
                this.validateDuplicates(
                    notasVenda.map(({ codigo }) => codigo),
                    notasVenda.map(({ numOportunidadeCRM }) => numOportunidadeCRM),
                    notasVenda.flatMap(({ vendasProduto }) =>
                        vendasProduto.flatMap((produtos) => produtos.fornecedoresId)
                    ),
                    undefined
                )
            ),
            this.validatePaymentMethods(saleInvoices.map(({ formaPagamentoId }) => formaPagamentoId)),
            this.validateCustomers(sales.map(({ clienteId }) => clienteId)),
            this.productService.validateIfExistMany(productsIds),
        ];

        await Promise.all(validatePromises);

        this.validateInvoiceDates(saleInvoices);
    }

    private validateIfCanBeUpdated = async (saleId: string, updateData: DataUpdateSale, query?: QueryUpdateSale) => {
        const sale = await this.validateIfExist(saleId, query);
        // Venda Paga não pode ser modificada(Editada ou Deletada) -OK
        // Vendas com status Initial, Audits podem ser alteradas -OK, mas as comissões não podem ser marcadas pagas pelo fornecedor -Commission.service
        // Venda Disponivel para Pagamento para ser alterada, precisa retroceder o estado -OK
        // Depois de Retroceder o estado, pode alterar mas, mantendo a comissão paga intacta -OK
        // No caso do participante a ser removido ter uma comissão paga, gera erro -OK
        // Para desativar participante com comissões pagas, somente se todas as comissões que ele tem estiverem pagas -User.service
        // Quando todas as comissões forem pagas o estado de venda muda para pago -OK

        this.validateIfHasSaleStatusPaid(sale.estadoVenda);

        if (sale.estadoVenda === EstadoVenda.AVAILABLE_PAYMENT && updateData.estadoVenda === sale.estadoVenda) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Antes Retroceder o estado da venda, depois alterar a proposta");
        }

        if (updateData.estadoVenda === EstadoVenda.PAID) {
            const hasUnpaidCommissions = sale.notasVenda.some(({ comissoes }) =>
                comissoes.some(({ comissaoPaga }) => comissaoPaga === false)
            );

            if (hasUnpaidCommissions) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Essa venda ainda contem comissões não pagas.");
            }
        }

        // Optimized
        const participantChanges = [
            {
                oldId: sale.accountManagerId,
                newId: updateData.accountManagerId,
                name: sale.accountManager?.user.name ?? "Account Manager",
            },
            {
                oldId: sale.insideSalesId,
                newId: updateData.insideSalesId,
                name: sale.insideSales?.user.name ?? "Inside Sales",
            },
            {
                oldId: sale.comercialManagerId,
                newId: updateData.comercialManagerId,
                name: sale.comercialManager?.user.name ?? "Comercial Manager",
            },
            {
                oldId: sale.solutionArchitectId,
                newId: updateData.solutionArchitectId,
                name: sale.solutionArchitect?.user.name ?? "Solution Architect",
            },
            {
                oldId: sale.comercialAssistantId,
                newId: updateData.comercialAssistantId,
                name: sale.comercialAssistant?.user.name ?? "Comercial Assistant",
            },
            { oldId: sale.referrerId, newId: updateData.referrerId, name: sale.referrer?.user.name ?? "Referrer" },
        ];

        participantChanges.forEach(({ oldId, newId, name }) => {
            if (oldId !== newId && oldId !== null) {
                this.verifyIfModifiedUserRolesHasPaidCommission(sale.notasVenda, oldId, name);
            }
        });

        // if (sale.accountManagerId !== updateData.accountManagerId && sale.accountManagerId !== null) {
        //     this.verifyIfModifiedUserRolesHasPaidCommission(
        //         sale.notasVenda,
        //         sale.accountManagerId,
        //         sale.accountManager?.user.name ?? "Account Manager"
        //     );
        // }
        // if (sale.insideSalesId !== updateData.insideSalesId && sale.insideSalesId !== null) {
        //     this.verifyIfModifiedUserRolesHasPaidCommission(
        //         sale.notasVenda,
        //         sale.insideSalesId,
        //         sale.insideSales?.user.name ?? "Inside Sales"
        //     );
        // }
        // if (sale.comercialManagerId !== updateData.comercialManagerId && sale.comercialManagerId !== null) {
        //     this.verifyIfModifiedUserRolesHasPaidCommission(
        //         sale.notasVenda,
        //         sale.comercialManagerId,
        //         sale.comercialManager?.user.name ?? "Comercial Manager"
        //     );
        // }
        // if (sale.solutionArchitectId !== updateData.solutionArchitectId && sale.solutionArchitectId !== null) {
        //     this.verifyIfModifiedUserRolesHasPaidCommission(
        //         sale.notasVenda,
        //         sale.solutionArchitectId,
        //         sale.solutionArchitect?.user.name ?? "Solution Architect"
        //     );
        // }
        // if (sale.comercialAssistantId !== updateData.comercialAssistantId && sale.comercialAssistantId !== null) {
        //     this.verifyIfModifiedUserRolesHasPaidCommission(
        //         sale.notasVenda,
        //         sale.comercialAssistantId,
        //         sale.comercialAssistant?.user.name ?? "Comercial Assistant"
        //     );
        // }
        // if (sale.referrerId !== updateData.referrerId && sale.referrerId !== null) {
        //     this.verifyIfModifiedUserRolesHasPaidCommission(
        //         sale.notasVenda,
        //         sale.referrerId,
        //         sale.referrer?.user.name ?? "Referrer"
        //     );
        // }

        const productsIds = updateData.notasVenda.flatMap(({ vendasProduto }) =>
            vendasProduto.map(({ produtoId }) => produtoId)
        );

        //Optimized Paralell Validations
        await Promise.all([
            this.validateIfUserRolesExists([updateData]),
            this.validateDuplicates(
                updateData.notasVenda.map(({ codigo }) => codigo),
                updateData.notasVenda.map(({ numOportunidadeCRM }) => numOportunidadeCRM),
                updateData.notasVenda.flatMap(({ vendasProduto }) =>
                    vendasProduto.flatMap((produtos) => produtos.fornecedoresId)
                )
            ),
            this.validatePaymentMethods(updateData.notasVenda.map(({ formaPagamentoId }) => formaPagamentoId)),
            this.validateCustomers([updateData.clienteId]),
            this.productService.validateIfExistMany(productsIds),
        ]);

        // await this.validateIfUserRolesExists([updateData]);
        // await this.validateDuplicates(
        //     updateData.notasVenda.map(({ codigo }) => codigo),
        //     saleId
        // );
        // await this.validatePaymentMethods(updateData.notasVenda.map(({ formaPagamentoId }) => formaPagamentoId));
        // await this.validateCustomers([updateData.clienteId]);
        // await this.productService.validateIfExistMany(productsIds);

        this.validateInvoiceDates(updateData.notasVenda);

        const newInvoicesWithCommissionsMappedBySaleId =
            await this.getNewInvoicesNormalizedWithCommissionsMappedBySaleId([{ id: saleId, ...updateData }]);
        const newInvoicesWithCommissions = newInvoicesWithCommissionsMappedBySaleId[sale.id];

        this.validateOldSaleInvoicesWithPaidCommissionsArePreserved(sale.notasVenda, newInvoicesWithCommissions);

        return sale;
    };

    private async validateIfCanBeDeleted(saleId: string, query?: QueryDeleteSale) {
        const sale = await this.validateIfExist(saleId, query);

        this.validateIfHasSaleStatusPaid(sale.estadoVenda);

        if (sale.notasVenda.some(({ comissoes }) => comissoes.some(({ comissaoPaga }) => comissaoPaga === true)))
            throw new ApiError(httpStatus.BAD_REQUEST, "Vendas com comissões pagas não podem ser modificadas.");

        return sale;
    }

    private async validateIfExist(saleId: string, query?: QueryGetSale) {
        const sale = await this.getOneBy(saleId, query);
        if (!sale) throw new ApiError(httpStatus.NOT_FOUND, "Venda não encontrada");

        return sale;
    }

    private validateIfHasSaleStatusPaid(estadoVenda: EstadoVenda) {
        if (estadoVenda === EstadoVenda.PAID) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Venda paga não pode ser modificada.");
        }
    }

    private validateOldSaleInvoicesWithPaidCommissionsArePreserved(
        oldInvoices: SaleInvoice[],
        newInvoices: NewSaleInvoiceNormalizedWithCommissions[]
    ) {
        const oldInvoicesWithPaidCommissions = oldInvoices.filter(({ comissoes }) =>
            comissoes.some(({ comissaoPaga }) => comissaoPaga === true)
        );

        const oldInvoicesWithPaidCommissionsArePreserved = oldInvoicesWithPaidCommissions.every((oldInvoice) => {
            return this.findMatchedNewInvoice(oldInvoice, newInvoices);
        });

        if (!oldInvoicesWithPaidCommissionsArePreserved)
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Não é possível modificar codigo de notas, datas de faturamentos ou datas de boleto onde existem comissões pagas."
            );
    }

    private handleRoleValidationError(error: any, roleType: string): void {
        // Convert role validation errors to 404 if role type doesn't match or doesn't exist
        throw new ApiError(httpStatus.NOT_FOUND, `Nenhum usuário encontrado com a função de ${roleType}.`);
    }

    private async validateIfUserRolesExists(updateSales: DataCreateSale[]) {
        const salePersonIds = updateSales.flatMap(({ accountManagerId, insideSalesId }) =>
            [accountManagerId, insideSalesId].filter((id) => id !== null)
        );
        const managerIds = updateSales.map(({ comercialManagerId }) => comercialManagerId).filter((id) => id !== null);
        const architectIds = updateSales
            .map(({ solutionArchitectId }) => solutionArchitectId)
            .filter((id) => id !== null);
        const assistantIds = updateSales
            .map(({ comercialAssistantId }) => comercialAssistantId)
            .filter((id) => id !== null);
        const referrerIds = updateSales.map(({ referrerId }) => referrerId).filter((id) => id !== null);

        //Optimized Paralell Validations
        const validationPromises = [
            this.userRoleService.validateUserRoles(salePersonIds, Role.VENDEDOR),
            this.userRoleService.validateUserRoles(managerIds, Role.COMERCIAL_MANAGER),
            this.userRoleService.validateUserRoles(architectIds, Role.SOLUTION_ARCHITECT),
            this.userRoleService.validateUserRoles(assistantIds, Role.COMERCIAL_ASSISTANT),
            this.userRoleService.validateUserRoles(referrerIds, Role.REFERRER),
        ];

        await Promise.all(validationPromises);
    }

    // Optimized: O(n) - create Map once, reuse
    private verifyIfModifiedUserRolesHasPaidCommission(
        notasVenda: SaleInvoice[],
        userRoleId: string | null,
        userRoleToValidate: string
    ) {
        if (!userRoleId) return;

        const hasPaidCommission = notasVenda
            .flatMap((invoice) => invoice.comissoes)
            .some((commission) => commission.userRoleId === userRoleId && commission.comissaoPaga);

        if (hasPaidCommission) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Não é possível remover ${userRoleToValidate} da venda com sua comissão paga.`
            );
        }
        // const hasPaidCommissionsForOldUserRole = notasVenda.some((invoice) =>
        //     invoice.comissoes.some(
        //         ({ userRoleId: comissaoUserRoleId, comissaoPaga }) =>
        //             comissaoUserRoleId === userRoleId && comissaoPaga === true
        //     )
        // );
        // if (hasPaidCommissionsForOldUserRole) {
        //     throw new ApiError(
        //         httpStatus.BAD_REQUEST,
        //         `Não é possível remover ${userRoleToValidate} da venda com sua comissão paga.`
        //     );
        // }
    }

    private async validateDuplicates(
        invoiceCodes: (string | null)[],
        CRM: (string | null)[],
        fornecedoresId: string[],
        saleIdUpdating?: string
    ) {
        const filteredInvoicesCode = invoiceCodes.filter((invoiceCode) => invoiceCode !== null);

        // const filteredInvoicesCRM = CRM != undefined ? CRM.filter((crm) => crm !== null) : CRM;

        const saleWithSameInvoiceCode = await prisma.venda.findFirst({
            select: { notasVenda: { select: { codigo: true }, where: { codigo: { in: filteredInvoicesCode } } } },
            where: {
                empresaId: this.context.currentUserRole.empresaId,
                id: { not: saleIdUpdating },
                notasVenda: {
                    some: {
                        AND: [
                            { codigo: { in: filteredInvoicesCode } },
                            // { numOportunidadeCRM: { in: filteredInvoicesCRM } },
                            // { vendasProduto: { some: { fornecedores: { every: { id: { in: fornecedoresId } } } } } },
                        ],
                    },
                },
            },
        });

        if (saleWithSameInvoiceCode)
            throw new ApiError(
                httpStatus.CONFLICT,
                `Já existe uma venda com a mesma nota ${saleWithSameInvoiceCode.notasVenda.at(0)?.codigo}!`
            );
    }

    private validateInvoiceDates(saleInvoices: NewSaleInvoice[]) {
        saleInvoices.forEach(({ formaParcelamento, datasBoleto }) => {
            if (datasBoleto.length !== formaParcelamento) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Quantidades de datas de boletos inválidas.");
            }
        });
    }

    private async validatePaymentMethods(paymentMethodsIds: string[]) {
        const paymentMethods = await prisma.formaPagamento.findMany({
            where: { id: { in: paymentMethodsIds }, empresaId: this.context.currentUserRole.empresaId },
        });
        //const someMethodNotExist = paymentMethodsIds.some((id) => paymentMethods.every((method) => method.id !== id));
        const methodIds = new Set(paymentMethods.map((m) => m.id));
        const someNotExist = paymentMethodsIds.some((id) => !methodIds.has(id));
        if (someNotExist) throw new ApiError(httpStatus.NOT_FOUND, "Método de pagamento não encontrado.");
    }

    private async validateCustomers(customersIds: string[]) {
        const customers = await prisma.cliente.findMany({
            where: { id: { in: customersIds }, empresaId: this.context.currentUserRole.empresaId },
        });
        //const someCustomerNotExist = customersIds.some((id) => customers.every((customer) => customer.id !== id));
        const methodIds = new Set(customers.map((m) => m.id));
        const someNotExist = customersIds.some((id) => !methodIds.has(id));
        if (someNotExist) throw new ApiError(httpStatus.NOT_FOUND, "Cliente não encontrado.");
    }

    private async sendEmailsIfSaleStatusChanged(
        newData: DataUpdateSale,
        oldStatus: EstadoVenda,
        reason?: string | null
    ) {
        if (oldStatus === newData.estadoVenda) return;

        switch (newData.estadoVenda) {
            case EstadoVenda.INITIAL:
                const accountManager = newData.accountManagerId
                    ? await this.userRoleService.getOneBy(newData.accountManagerId)
                    : null;
                const insideSales = newData.insideSalesId
                    ? await this.userRoleService.getOneBy(newData.insideSalesId)
                    : null;
                if (accountManager)
                    EmailService.sendSaleStatusChangedEmail(accountManager.user.email, newData.estadoVenda, reason);
                if (insideSales)
                    EmailService.sendSaleStatusChangedEmail(insideSales.user.email, newData.estadoVenda, reason);
                break;
            case EstadoVenda.BILLING_AUDIT:
                const commissioningAnalists = await this.userRoleService.findManyBy({
                    where: { role: Role.COMMISSIONING_ANALYST },
                });

                commissioningAnalists.forEach((analyst) => {
                    if (analyst)
                        EmailService.sendSaleStatusChangedEmail(analyst.user.email, newData.estadoVenda, reason);
                });
                break;
            case EstadoVenda.FINANCIAL_AUDIT:
                const comercialManagers = await this.userRoleService.findManyBy({
                    where: { role: Role.COMERCIAL_MANAGER },
                });

                comercialManagers.forEach((manager) => {
                    if (manager)
                        EmailService.sendSaleStatusChangedEmail(manager.user.email, newData.estadoVenda, reason);
                });
                break;
            case EstadoVenda.AVAILABLE_PAYMENT:
                const [admins, analysts] = await Promise.all([
                    this.userRoleService.findManyBy({ where: { role: Role.ADMIN } }),
                    this.userRoleService.findManyBy({ where: { role: Role.COMMISSIONING_ANALYST } }),
                ]);

                const commissionAnalist = [...admins, ...analysts];

                commissionAnalist.forEach((analyst) => {
                    if (analyst)
                        EmailService.sendSaleStatusChangedEmail(analyst.user.email, newData.estadoVenda, reason);
                });
                break;
            case EstadoVenda.PAID:
                break;
        }
    }

    public static getSaleStatusText(status: EstadoVenda): string {
        switch (status) {
            case EstadoVenda.INITIAL:
                return "Inicial";
            case EstadoVenda.BILLING_AUDIT:
                return "Auditoria faturamento";
            case EstadoVenda.FINANCIAL_AUDIT:
                return "Auditoria financeira";
            case EstadoVenda.AVAILABLE_PAYMENT:
                return "Disponível para pagamento";
            case EstadoVenda.PAID:
                return "Pago";
        }
    }
}
//TODO: Conferir melhorias sugeridas abaixo, caso aprovadas, implementar em todos os service
// 5. Index Invoice Data
//Pre-index invoices for faster lookups:

//const invoicesById = new Map(sale.notasVenda.map(inv => [inv.id, inv]));
//const saleInvoicesIds = Array.from(invoicesById.keys());

//7. Batch Database Queries
//Combine multiple independent database calls:
// Optimized: Parallel queries

// const [paymentMethods, customers] = await Promise.all([
//     prisma.formaPagamento.findMany({ where: { ... } }),
//     prisma.cliente.findMany({ where: { ... } }),
// ]);
