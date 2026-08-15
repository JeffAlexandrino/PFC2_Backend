import { FormaPagamento, Prisma } from "@prisma/client";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type NewPaymentMethodWithOrgId = NewPaymentMethod & Pick<FormaPagamento, "empresaId">;
export type UpdatePaymentMethodProps = NewPaymentMethod & Pick<FormaPagamento, "id">;
export type NewPaymentMethod = Pick<FormaPagamento, "name">;

//VALIDATIONS
export type ValidUpdatePaymentMethod = { params: { id: string }; body: { data: Omit<UpdatePaymentMethodProps, "id"> } };
export type ValidFindPaymentMethods = { query: FindQueryProps<PaymentMethodWhere, PaymentMethodSortBy> };
export type ValidCreatePaymentMethods = { body: { data: NewPaymentMethod[] } };
export type ValidDeletePaymentMethod = { params: { id: string } };
export type ValidGetPaymentMethod = { params: { id: string } };

export const PaymentMethodSortBy = Prisma.FormaPagamentoScalarFieldEnum;
export type PaymentMethodSortBy = Prisma.FormaPagamentoScalarFieldEnum;
export type PaymentMethodWhere = { name?: string };
