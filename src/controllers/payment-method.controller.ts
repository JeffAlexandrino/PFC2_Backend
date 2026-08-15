import PaymentMethodService from "../services/payment-method.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

import * as T from "../types/payment-method.types";

import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

export default class PaymentMethodController {
    public static createMany = catchAsync(async (req, res) => {
        const methodService = new PaymentMethodService(req.context);

        const validRequest = req as unknown as T.ValidCreatePaymentMethods;
        const newPaymentsMethods = validRequest.body.data;

        for (const newMethod of newPaymentsMethods) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
                "create",
                fnSubject("FormaPagamento", { ...newMethod })
            );
        }

        const createdPaymentsMethods = await methodService.createMany(newPaymentsMethods);
        res.status(httpStatus.CREATED).send(createdPaymentsMethods);
    });

    public static findMany = catchAsync(async (req, res) => {
        const methodService = new PaymentMethodService(req.context);

        const validRequest = req as unknown as T.ValidFindPaymentMethods;
        const params = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "read",
            fnSubject("FormaPagamento", { ...params })
        );

        const paymentsMethods = await methodService.findManyBy(validRequest.query);
        res.send(paymentsMethods);
    });

    public static getOne = catchAsync(async (req, res) => {
        const methodService = new PaymentMethodService(req.context);

        const validRequest = req as unknown as T.ValidGetPaymentMethod;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "read",
            fnSubject("FormaPagamento", { ...params })
        );

        const paymentMethod = await methodService.getOneBy(validRequest.params.id);
        if (!paymentMethod) throw new ApiError(httpStatus.NOT_FOUND, "Forma de pagamento não encontrada.");

        res.send(paymentMethod);
    });

    public static udpateOne = catchAsync(async (req, res) => {
        const methodService = new PaymentMethodService(req.context);

        const validRequest = req as unknown as T.ValidUpdatePaymentMethod;
        const params = { ...validRequest.body.data, ...validRequest.params };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "update",
            fnSubject("FormaPagamento", { ...params })
        );

        const updateProps = { id: validRequest.params.id, ...validRequest.body.data };

        const updatedPaymentMethod = await methodService.updateOne(updateProps);
        res.send(updatedPaymentMethod);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const methodService = new PaymentMethodService(req.context);

        const validRequest = req as unknown as T.ValidDeletePaymentMethod;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
            "delete",
            fnSubject("FormaPagamento", { ...params })
        );

        await methodService.deleteOneBy(validRequest.params.id);
        res.status(httpStatus.NO_CONTENT).send();
    });
}
