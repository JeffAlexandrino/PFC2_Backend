import { UpdateOrganizationProps, OrganizationSortBy, OrganizationWhere } from "../types/organization.types";
import { Acao, EmpresaLogo, Tabela } from "@prisma/client";
import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";

import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

export default class OrganizationService {
    private readonly context: RequestContext;

    constructor(context: RequestContext) {
        this.context = context;
    }

    public findMany = async (query: FindQueryProps<OrganizationWhere, OrganizationSortBy>) => {
        const { userId, name, cnpj, ...where } = query.where ?? {};

        return prisma.empresa.findMany({
            where: {
                id: where.id,
                name: name ? { contains: name, mode: "insensitive" } : undefined,
                cnpj: cnpj ? { contains: cnpj, mode: "insensitive" } : undefined,
                userRoles: userId ? { some: { userId } } : undefined,
            },
            include: { userRoles: { where: { userId } } },
            ...PrismaUtils.extractSortPageInfoFrom(query, "name", "asc"),
        });
    };

    public updateOne = async (updateProps: UpdateOrganizationProps, logoFile?: Express.Multer.File) => {
        await this.validateIfExist(updateProps.id);
        await this.validateDuplications([updateProps.cnpj], updateProps.id);

        //TODO: fix this function
        // const _deletedOrganizationLogo = prisma.empresaLogo.deleteMany({ where: { empresaId: updateProps.id } });

        // // convert Node Buffer -> ArrayBuffer (sliced to get a plain ArrayBuffer) -> Uint8Array
        // let empresaLogoCreate;
        // if (logoFile) {
        //     const ab = logoFile.buffer.buffer.slice(
        //         logoFile.buffer.byteOffset,
        //         logoFile.buffer.byteOffset + logoFile.buffer.byteLength
        //     ); // returns a plain ArrayBuffer
        //     empresaLogoCreate = {
        //         create: {
        //             buffer: new Uint8Array(ab),
        //             fileName: logoFile.originalname,
        //             mimetype: logoFile.mimetype,
        //         },
        //     };
        // }

        // const _editedOrganization = prisma.empresa.update({
        //     where: { id: updateProps.id },
        //     data: {
        //         ...updateProps,
        //         empresaLogo: empresaLogoCreate,
        //         // empresaLogo: logoFile
        //         //     ? {
        //         //           create: {
        //         //               //   buffer: new Uint8Array(
        //         //               //       logoFile.buffer.buffer,
        //         //               //       logoFile.buffer.byteOffset,
        //         //               //       logoFile.buffer.byteLength
        //         //               //   ),
        //         //               buffer: logoFile.buffer,
        //         //               fileName: logoFile.originalname,
        //         //               mimetype: logoFile.mimetype,
        //         //           },
        //         //       }
        //         //     : undefined,
        //     },
        // });
        // const _audit = auditService.createAudit({
        //             data: [{ ...updateProps }],
        //             action: Acao.UPDATE,
        //             table: Tabela.ORGANIZACAO,
        //             context: this.context,
        //         });
        // const [_, editedOrganization] = await prisma.$transaction([_deletedOrganizationLogo, _editedOrganization]);
        // return editedOrganization;
        return;
    };

    public getOneByContext = async () => {
        return prisma.empresa.findUnique({
            include: { empresaLogo: true },
            where: { id: this.context.currentUserRole.empresaId },
        });
    };

    public static getLogoInnfo = (empresaLogo: Pick<EmpresaLogo, "mimetype" | "buffer">) => {
        const base64Image = Buffer.from(empresaLogo.buffer).toString("base64");
        return `data:${empresaLogo.mimetype};base64,${base64Image}`;
    };

    private validateIfExist = async (organizationId: string) => {
        const organization = await prisma.empresa.findUnique({
            where: { id: organizationId, userRoles: { some: { userId: this.context.currentUserRole.userId } } },
        });

        if (!organization) throw new ApiError(httpStatus.NOT_FOUND, "Empresa não encontrada!");
    };

    private validateDuplications = async (cnpjs: string[], organizationIdUpdating?: string) => {
        const organizationWithSameCNPJ = await prisma.empresa.findFirst({
            where: { cnpj: { in: cnpjs }, id: { not: organizationIdUpdating } },
        });

        if (organizationWithSameCNPJ)
            throw new ApiError(httpStatus.BAD_REQUEST, `O CNPJ ${organizationWithSameCNPJ.cnpj} já está em uso!`);
    };
}
