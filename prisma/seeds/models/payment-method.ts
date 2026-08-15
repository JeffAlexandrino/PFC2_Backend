import { NewPaymentMethodWithOrgId } from "../../../src/types/payment-method.types";
import { organizationA } from "./organization";

export type PaymentMethodTypeSeed = NewPaymentMethodWithOrgId & { id: string };

export const paymentMethodA: PaymentMethodTypeSeed = {
    id: "paymentMethodA",
    name: "FormaPagamentoA",
    empresaId: organizationA.id,
};

export const paymentMethodB: PaymentMethodTypeSeed = {
    id: "paymentMethodB",
    name: "FormaPagamentoB",
    empresaId: organizationA.id,
};
