import { EstadoVenda, Prisma, TipoFaturamento, TipoMoeda } from "@prisma/client";

import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupQuerySchema from "./schema-base/yup-query.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yup from "../config/yup";

export default class SaleValidator {
    private static objectSchemaToCreateOrUpdate = {
        accountManagerId: yup.string().defined("Deve ser passado o accountManagerId.").nullable(),
        insideSalesId: yup.string().required("Deve ser passado o insideSalesId.").nullable(),
        comercialManagerId: yup
            .string()
            .defined("Deve ser passado o comercialManagerId.")
            .nullable()
            .when("accountManagerId", ([accountManagerId], schema) =>
                accountManagerId ? schema : schema.nonNullable()
            ),
        referrerId: yup.string().defined("Deve ser passado o referrerId.").nullable(),
        comercialAssistantId: yup.string().defined("Deve ser passado o comercialAssistantId.").nullable(),
        solutionArchitectId: yup.string().defined("Deve ser passado o solutionArchitectId.").nullable(),
        estadoVenda: yup
            .mixed<EstadoVenda>()
            .oneOf(Object.values(EstadoVenda))
            .required("Deve ser passado o estadoVenda."),
        clienteId: yup.string().required("Deve ser passado o clienteId."),
        contratoId: yup.string().defined("Deve ser passado o contratoId.").nullable(),
        dataVenda: yup.date().required("Deve ser passado a dataVenda."),
        vendaRenovacao: yup.boolean().required("Deve ser passado a vendaRenovacao."),
        numOportunidadeCRM: yup.string().optional().nullable(), //TODO: quando movida para notas Coluna para deletar
        numPedidoDistribuidor: yup.string().optional().nullable(), //TODO: quando movida para notas Coluna para deletar
        notasVenda: yup
            .array(
                yup.object({
                    codigo: yup.string().required("Deve ser passado o codigo CRM.").nullable(),
                    formaParcelamento: yup
                        .number()
                        .min(1, "O formaParcelamento mínimo é 1.")
                        .integer("O formaParcelamento deve ser inteiro.")
                        .required("Deve ser passado o formaParcelamento."),
                    dataFaturamento: yup.date().required("Deve ser passado a dataFaturamento."),
                    formaPagamentoId: yup.string().required("Deve ser passado o formaPagamentoId."),
                    numOportunidadeCRM: yup.string().defined("CRM vendas").nullable(), //TODO: Depois de adicionar os valores no banco, remover nullable
                    numPedidoDistribuidor: yup.string().defined("Deve ser passado o numPedidoDistribuidor.").nullable(),
                    dedutiveisDistribuidor: yup
                        .number()
                        .defined("Deve ser passado o dedutiveisDistribuidor.")
                        .nullable(),
                    tipoFaturamento: yup
                        .mixed<TipoFaturamento>()
                        .oneOf(Object.values(TipoFaturamento))
                        .defined("Deve ser passado o tipoFaturamento.")
                        .nullable(), //TODO: Depois de adicionar os valores no banco, remover nullable
                    impostoNota: yup.number().defined("Deve ser passado o impostoNota.").nullable(),
                    markup: yup.number().defined("Deve ser passado o markup.").nullable(),
                    vendasProduto: yup
                        .array(
                            yup
                                .object({
                                    produtoId: yup.string().required("Deve ser passado um produtoId."),
                                    quantidade: yup
                                        .number()
                                        .min(1, "Quantidade mínima 1.")
                                        .required("Deve ser passada a quantidade."),
                                    valorCustoUnit: yup
                                        .number()
                                        .min(1, "O valor do custo unitário não pode ser zero.")
                                        .required("Deve ser passado o valorCustoUnit."),
                                    tipoMoeda: yup
                                        .mixed<TipoMoeda>()
                                        .oneOf(Object.values(TipoMoeda))
                                        .defined("Deve ser passado o tipoMoeda produto.")
                                        .nullable(),
                                    cotacao: yup
                                        .number()
                                        .min(0.000001, "O valor da cotação não pode ser zero.")
                                        .required("Deve ser passado a cotacao."),
                                    fornecedoresId: yup
                                        .array<string[]>()
                                        .required("Deve ser passado um fornecedoresId.")
                                        .min(1, "Selecione um fornecedor"),
                                    dedutiveisDistribuidor: yup
                                        .number()
                                        .defined("Deve passar o dedutiveisDistribuidor produto.")
                                        .nullable(), //TODO: quando movida para notas Coluna para deletar
                                    tipoFaturamento: yup
                                        .mixed<TipoFaturamento>()
                                        .oneOf(Object.values(TipoFaturamento))
                                        .defined("Deve ser passado o tipoFaturamento produto.")
                                        .nullable(), //TODO: quando movida para notas Coluna para deletar
                                    impostoNota: yup
                                        .number()
                                        .defined("Deve ser passado o impostoNota produto.")
                                        .nullable(), //TODO: quando movida para notas Coluna para deletar
                                    markup: yup.number().defined("Deve ser passado o markup produto.").nullable(), //TODO: quando movida para notas Coluna para deletar
                                })
                                .noUnknown(true)
                                .strict()
                        )
                        .required("Deve ser passado um vendasProduto."),
                    vendasServico: yup
                        .array(
                            yup
                                .object({
                                    servicoId: yup.string().required("Deve ser passado o servicoId."),
                                    qntdHorasComercial: yup.number().required("Deve ser passado a qntdHorasComercial."),
                                    qntdHorasNaoComercial: yup
                                        .number()
                                        .required("Deve ser passado a qntdHorasNaoComercial."),
                                    qntdHorasEspecial: yup.number().required("Deve ser passado a qntdHorasEspecial."),
                                    cotacao: yup
                                        .number()
                                        .defined("Deve ser passado a cotacao.")
                                        .min(0.000001, "O valor da cotação não pode ser zero."),
                                    tipoMoeda: yup
                                        .mixed<TipoMoeda>()
                                        .oneOf(Object.values(TipoMoeda))
                                        .defined("Deve ser passado o tipoMoeda servico.")
                                        .nullable(),
                                    dedutiveisDistribuidor: yup
                                        .number()
                                        .defined("Deve ser passado o dedutiveisDistribuidor servico.")
                                        .nullable(), //TODO: quando movida para notas Coluna para deletar
                                    tipoFaturamento: yup
                                        .mixed<TipoFaturamento>()
                                        .oneOf(Object.values(TipoFaturamento))
                                        .defined("Deve ser passado o tipoFaturamento servico.")
                                        .nullable(), //TODO: quando movida para notas Coluna para deletar
                                    impostoNota: yup
                                        .number()
                                        .defined("Deve ser passado o impostoNota servico.")
                                        .nullable(), //TODO: quando movida para notas Coluna para deletar
                                    markup: yup.number().defined("Deve ser passado o markup servico.").nullable(), //TODO: quando movida para notas Coluna para deletar
                                })
                                .noUnknown(true)
                                .strict()
                        )
                        .required("Deve ser passado o vendasServico."),
                    datasBoleto: yup.array(yup.date().required()).required("Deve ser passado um dataBoletos."),
                })
            )
            .required("Deve ser passado um notasVenda."),
    };

    public static createSale = yup.object({
        body: yupBodySchema({ data: yupDataArrSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static findSales = yup.object({
        query: yupFindQuerySchema(
            {
                gte_dataVenda: yup.date(),
                lte_dataVenda: yup.date(),
                gte_dataFaturamento: yup.date(),
                lte_dataFaturamento: yup.date(),
                gte_invoiceDate: yup.date(),
                lte_invoiceDate: yup.date(),
                gte_updatedAt: yup.date(),
                lte_updatedAt: yup.date(),
                clienteId: yup.string(),
                estadoVenda: yup.mixed<EstadoVenda>().oneOf(Object.values(EstadoVenda)),
                salePersonId: yup.string(),
                referrerId: yup.string(),
                formaPagamentoId: yup.string(),
                contratoId: yup.string(),
                numOportunidadeCRM: yup.string(), //TODO: Apos migrar os dados para o codigo Nota, remover esse
                numPedidoDistribuidor: yup.string(),
                codigoNota: yup.string(),
                vendaRenovacao: yup.string(),
                solutionArchitectId: yup.string(),
                comercialAssistantId: yup.string(),
                comercialManagerId: yup.string(),
                accountManagerId: yup.string(),
            },
            Object.values(Prisma.VendaScalarFieldEnum)
        ),
    });

    public static getSale = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        query: yupQuerySchema({
            accountManagerIdAtual: yup.string(),
            insideSalesIdAtual: yup.string(),
            estadoVendaAtual: yup.mixed<EstadoVenda>().oneOf(Object.values(EstadoVenda)),
        }),
    });

    public static updateSale = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        query: yupQuerySchema({
            accountManagerIdAtual: yup.string(),
            insideSalesIdAtual: yup.string(),
            estadoVendaAtual: yup.mixed<EstadoVenda>().oneOf(Object.values(EstadoVenda)),
        }),
        body: yupBodySchema({
            data: yupDataSchema(this.objectSchemaToCreateOrUpdate),
            reasonRegressionStatus: yup.string().max(100),
        }),
    });

    public static deleteSale = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        query: yupQuerySchema({
            insideSalesIdAtual: yup.string(),
            accountManagerIdAtual: yup.string(),
            estadoVendaAtual: yup.mixed<EstadoVenda>().oneOf(Object.values(EstadoVenda)),
        }),
    });
}

export type ValidCreateSale = yup.InferType<typeof SaleValidator.createSale>;
export type DataCreateSale = ValidCreateSale["body"]["data"][number];

export type ValidFindSales = yup.InferType<typeof SaleValidator.findSales>;
export type QueryFindSales = ValidFindSales["query"];

export type ValidGetSale = yup.InferType<typeof SaleValidator.getSale>;
export type ParamsGetSale = ValidGetSale["params"];
export type QueryGetSale = ValidGetSale["query"];

export type ValidUpdateSale = yup.InferType<typeof SaleValidator.updateSale>;
export type DataUpdateSale = ValidUpdateSale["body"]["data"];
export type QueryUpdateSale = ValidUpdateSale["query"];

export type ValidDeleteSale = yup.InferType<typeof SaleValidator.deleteSale>;
export type ParamsDeleteSale = ValidDeleteSale["params"];
export type QueryDeleteSale = ValidDeleteSale["query"];
