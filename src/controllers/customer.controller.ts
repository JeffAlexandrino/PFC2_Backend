import CustomerService from "../services/customer.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import * as T from "../types/customer.types";

export default class CustomerController {
    public static createMany = catchAsync(async (req, res) => {
        const customerService = new CustomerService(req.context);

        const validRequest = req as unknown as T.ValidCreateCustomers;
        const newCustomers = validRequest.body.data;

        for (const customer of newCustomers) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
                "create",
                fnSubject("Cliente", { ...customer })
            );
        }

        const createdCustomers = await customerService.createMany(newCustomers);
        res.status(httpStatus.CREATED).send(createdCustomers);
    });

    public static importMany = catchAsync(async (req, res) => {
        const customerService = new CustomerService(req.context);

        const validRequest = req as unknown as T.ValidImportCustomers;
        const newCustomers = validRequest.body.data;

        for (const customer of newCustomers) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
                "create",
                fnSubject("Cliente", { ...customer })
            );
        }

        const createdCustomers = await customerService.importMany(newCustomers);
        res.status(httpStatus.CREATED).send(createdCustomers);
    });

    public static findMany = catchAsync(async (req, res) => {
        const customerService = new CustomerService(req.context);

        const validRequest = req as unknown as T.ValidFindCustomers;
        const where = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Cliente", { ...where }));

        const result = await customerService.findManyBy(validRequest.query);
        res.send(result);
    });

    public static getOne = catchAsync(async (req, res) => {
        const customerService = new CustomerService(req.context);

        const validRequest = req as unknown as T.ValidGetCustomer;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Cliente", { ...params }));

        const customer = await customerService.getOneBy(validRequest.params.id);
        if (!customer) throw new ApiError(httpStatus.NOT_FOUND, "Cliente não encontrado.");

        res.send(customer);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const customerService = new CustomerService(req.context);

        const validRequest = req as unknown as T.ValidUpdateCustomer;
        const params = { ...validRequest.body.data, ...validRequest.params };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Cliente", { ...params }));

        const updateProps = { id: params.id, ...validRequest.body.data };

        const cliente = await customerService.updateOne(updateProps);
        res.send(cliente);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const customerService = new CustomerService(req.context);

        const validRequest = req as unknown as T.ValidDeleteCustomer;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("delete", fnSubject("Cliente", { ...params }));

        await customerService.deleteOne(params.id);
        res.status(httpStatus.NO_CONTENT).send();
    });
}
