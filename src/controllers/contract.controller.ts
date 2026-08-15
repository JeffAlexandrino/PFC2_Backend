import ContractService from "../services/contract.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import * as T from "../types/contract.type";

export default class ContractController {
    public static createMany = catchAsync(async (req, res) => {
        const contractService = new ContractService(req.context);

        const validRequest = req as unknown as T.ValidCreateContracts;
        const newContracts = validRequest.body.data;

        for (const contract of newContracts) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
                "create",
                fnSubject("Contrato", { ...contract })
            );
        }

        const createdContracts = await contractService.createMany(newContracts);
        res.status(httpStatus.CREATED).send(createdContracts);
    });

    public static findMany = catchAsync(async (req, res) => {
        const contractService = new ContractService(req.context);

        const validRequest = req as unknown as T.ValidFindContracts;
        const where = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Contrato", { ...where }));

        const contracts = await contractService.findManyBy(validRequest.query);
        res.send(contracts);
    });

    public static getOne = catchAsync(async (req, res) => {
        const contractService = new ContractService(req.context);

        const validRequest = req as unknown as T.ValidGetContract;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Contrato", { ...params }));

        const contract = await contractService.getOneBy(validRequest.params.id);
        if (!contract) throw new ApiError(httpStatus.NOT_FOUND, "Contrato não encontrado.");

        res.send(contract);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const contractService = new ContractService(req.context);

        const validRequest = req as unknown as T.ValidUpdateContract;
        const params = { ...validRequest.params, ...validRequest.body.data };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Contrato", { ...params }));

        const contractData = { id: params.id, ...validRequest.body.data };

        const updatedContract = await contractService.updateOne(contractData);
        res.send(updatedContract);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const contractService = new ContractService(req.context);

        const validRequest = req as unknown as T.ValidDeleteContract;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("delete", fnSubject("Contrato", { ...params }));

        await contractService.deleteOne(validRequest.params.id);
        res.status(httpStatus.NO_CONTENT).send();
    });
}
