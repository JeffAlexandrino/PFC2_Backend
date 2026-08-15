import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupQuerySchema from "./schema-base/yup-query.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yup from "../config/yup";

import { TipoGasto, TravelType, VisitType } from "@prisma/client";

import * as T from "../types/visit.types";

export default class VisitValidator {
    private static objectSchemaToCreate = {
        dataVisita: yup.date().defined("Deve ser passado um valor para dataVisita."),
        salePersonId: yup.string().defined("Deve ser passado um valor para vendedorRoleId."),
        clienteId: yup.string().defined("Deve ser passado um valor para clienteId."),
        comentarios: yup.string().nullable().notRequired(),
        tipoVisita: yup.mixed<VisitType>().oneOf(Object.values(VisitType)),
        remoto: yup.boolean().defined("Deve ser passado um valor remoto."),
        visitaPaga: yup.boolean().required("Deve ser passado um visitaPaga."),
        gastos: yup
            .array(
                yup.object({
                    nota: yup.string().defined(),
                    tipoGasto: yup.mixed<TipoGasto>().oneOf(Object.values(TipoGasto)).required(),
                    valor: yup.number().required(),
                    tipoViagem: yup
                        .mixed<TravelType>()
                        .oneOf(Object.values(TravelType) as TravelType[])
                        .when("tipoGasto", {
                            is: TipoGasto.VIAGEM,
                            then: (schema) => schema.required("Tipo de viagem é obrigatório para VIAGEM."),
                            otherwise: (schema) => schema.notRequired(),
                        }),
                    dataViagem: yup.date().when("tipoGasto", {
                        is: TipoGasto.VIAGEM,
                        then: (schema) => schema.required("Data da viagem é obrigatória para VIAGEM."),
                        otherwise: (schema) => schema.notRequired(),
                    }),
                    carroEmpresa: yup.boolean().when("tipoGasto", {
                        is: TipoGasto.COMBUSTIVEL,
                        then: (schema) => schema.required("O campo carroEmpresa é obrigatório para COMBUSTIVEL."),
                        otherwise: (schema) => schema.notRequired(),
                    }),
                    kmInicial: yup
                        .number()
                        .min(0, "Km Inicial deve ser >= 0")
                        .when("tipoGasto", {
                            is: TipoGasto.COMBUSTIVEL,
                            then: (schema) => schema.required("Km Inicial é obrigatório para COMBUSTIVEL."),
                            otherwise: (schema) => schema.notRequired(),
                        }),
                    kmFinal: yup
                        .number()
                        .min(0, "Km Final deve ser maior ou igual ao Km Inicial.")
                        .when("tipoGasto", {
                            is: TipoGasto.COMBUSTIVEL,
                            then: (schema) => schema.required("Km Final é obrigatório para COMBUSTIVEL."),
                            otherwise: (schema) => schema.notRequired(),
                        }),
                })
            )
            .required(),
    };

    private static objectSchemaToUpdate = {
        dataVisita: yup.date().defined("Deve ser passado um valor para dataVisita."),
        salePersonId: yup.string().defined("Deve ser passado um valor para vendedorRoleId."),
        clienteId: yup.string().defined("Deve ser passado um valor para clienteId."),
        comentarios: yup.string().nullable().notRequired(),
        tipoVisita: yup.mixed<VisitType>().oneOf(Object.values(VisitType)),
        remoto: yup.boolean().defined("Deve ser passado um valor remoto."),
        visitaPaga: yup.boolean().required("Deve ser passado um visitaPaga."),
        carroEmpresa: yup.boolean().optional().nullable(),
        kmInicial: yup.number().optional().nullable(),
        kmFinal: yup.number().optional().nullable(),
        gastos: yup
            .array(
                yup.object({
                    nota: yup.string().defined(),
                    visitaId: yup.string(),
                    tipoGasto: yup.mixed<TipoGasto>().oneOf(Object.values(TipoGasto)).required(),
                    valor: yup.number().required(),
                    tipoViagem: yup
                        .mixed<TravelType>()
                        .oneOf(Object.values(TravelType) as TravelType[])
                        .when("tipoGasto", {
                            is: TipoGasto.VIAGEM,
                            then: (schema) => schema.required("Tipo de viagem é obrigatório para VIAGEM."),
                            otherwise: (schema) => schema.notRequired(),
                        }),
                    dataViagem: yup.date().when("tipoGasto", {
                        is: TipoGasto.VIAGEM,
                        then: (schema) => schema.required("Data da viagem é obrigatória para VIAGEM."),
                        otherwise: (schema) => schema.notRequired(),
                    }),
                    carroEmpresa: yup.boolean().when("tipoGasto", {
                        is: TipoGasto.COMBUSTIVEL,
                        then: (schema) => schema.required("O campo carroEmpresa é obrigatório para COMBUSTIVEL."),
                        otherwise: (schema) => schema.notRequired(),
                    }),
                    kmInicial: yup
                        .number()
                        .min(0, "Km Inicial deve ser >= 0")
                        .when("tipoGasto", {
                            is: TipoGasto.COMBUSTIVEL,
                            then: (schema) => schema.required("Km Inicial é obrigatório para COMBUSTIVEL."),
                            otherwise: (schema) => schema.notRequired(),
                        }),
                    kmFinal: yup
                        .number()
                        .min(0, "Km Final deve ser maior ou igual ao Km Inicial.")
                        .when("tipoGasto", {
                            is: TipoGasto.COMBUSTIVEL,
                            then: (schema) => schema.required("Km Final é obrigatório para COMBUSTIVEL."),
                            otherwise: (schema) => schema.notRequired(),
                        }),
                })
            )
            .required(),
    };

    public static createVisits = yup.object({
        body: yupBodySchema({ data: yupDataArrSchema(this.objectSchemaToCreate) }),
    });

    public static findVisits = yup.object({
        query: yupFindQuerySchema(
            {
                salePersonId: yup.string(),
                carroEmpresa: yup.string(),
                gte_dataVisita: yup.date(),
                lte_dataVisita: yup.date(),
                gte_updatedAt: yup.date(),
                lte_updatedAt: yup.date(),
                comentarios: yup.string(),
                codigoNota: yup.string(),
                visitaPaga: yup.string(),
                clienteId: yup.string(),
                remoto: yup.string(),
                tipoVisita: yup
                    .mixed<VisitType>()
                    .oneOf(Object.values(VisitType), "TipoVisita deve ser um dos valores válidos."),
            },
            Object.values(T.VisitSortBy)
        ),
    });

    public static getVisit = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        query: yupQuerySchema({ salePersonId: yup.string() }),
    });

    public static updateVisit = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({ data: yupDataSchema(this.objectSchemaToUpdate) }),
        query: yupQuerySchema({ currentSalePersonId: yup.string() }),
    });

    public static updateVisitsStatusPaid = yup.object({
        body: yupBodySchema({
            data: yupDataSchema({
                visitasId: yup.array().of(yup.string().required()).required("Deve ser passado um visitaId."),
            }),
        }),
    });

    public static deleteVisit = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        query: yupQuerySchema({ currentSalePersonId: yup.string() }),
    });

    public static findTotalVisitExpensesBySalePersonRole = yup.object({
        query: yupQuerySchema({
            where: yup
                .object({
                    gte_dataVisita: yup.date().required("Deve ser passado um gte_dataVisita."),
                    lte_dataVisita: yup.date().required("Deve ser passado um lte_dataVisita."),
                    salePersonId: yup.string(),
                })
                .required("Deve ser passado um where.")
                .noUnknown(true)
                .strict(),
        }),
    });
}

export type ValidCreateVisit = yup.InferType<typeof VisitValidator.createVisits>;
export type DataCreateVisit = ValidCreateVisit["body"]["data"][number];

export type ValidFindVisits = yup.InferType<typeof VisitValidator.findVisits>;
export type QueryFindVisits = ValidFindVisits["query"];

export type ValidGetVisit = yup.InferType<typeof VisitValidator.getVisit>;
export type ParamsGetVisit = ValidGetVisit["params"];
export type QueryGetVisit = ValidGetVisit["query"];

export type ValidUpdateVisit = yup.InferType<typeof VisitValidator.updateVisit>;
export type DataUpdateVisit = ValidUpdateVisit["body"]["data"];
export type QueryUpdateVisit = ValidUpdateVisit["query"];

export type ValidDeleteVisit = yup.InferType<typeof VisitValidator.deleteVisit>;
export type ParamsDeleteVisit = ValidDeleteVisit["params"];
export type QueryDeleteVisit = ValidDeleteVisit["query"];

export type ValidUpdateVisitStatusPaid = yup.InferType<typeof VisitValidator.updateVisitsStatusPaid>;
export type DataUpdateVisitStatusPaid = ValidUpdateVisitStatusPaid["body"]["data"];

export type ValidFindVisitsTotalExpensesPerRole = yup.InferType<
    typeof VisitValidator.findTotalVisitExpensesBySalePersonRole
>;
export type QueryFindVisitsTotalExpensesPerRole = ValidFindVisitsTotalExpensesPerRole["query"];
