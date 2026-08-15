import OrganizationService from "../services/organization.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";

import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import * as T from "../types/organization.types";

export default class OrganizationController {
    public static findMany = catchAsync(async (req, res) => {
        const organizationService = new OrganizationService(req.context);

        const validRequest = req as unknown as T.ValidFindOrganizations;
        const params = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Empresa", { ...params }));

        const orgs = await organizationService.findMany(validRequest.query);
        res.status(httpStatus.OK).send(orgs);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const organizationService = new OrganizationService(req.context);

        const validRequest = req as unknown as T.ValidUpdateOrganization;
        const params = validRequest.body.data;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Empresa", { ...params }));

        const companyData = { id: validRequest.params.id, ...validRequest.body.data };

        const company = await organizationService.updateOne(companyData, req.file);
        res.send(company);
    });
}
