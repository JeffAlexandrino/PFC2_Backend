import {
    QueryGetOneUser,
    QueryUpdateUserRoles,
    QueryUpdateUserInfo,
    DataUpdateUserRoles,
    QueryFindUsers,
    DataCreateUser,
    QueryDeleteUser,
    DataUpdateUserInfo,
} from "../validations/user.validator";
import { encryptPassword, generateRandomPassword } from "../utils/encryption";
import { NOT_COMERCIAL_ROLES } from "../types/user-role.types";
import { RequestContext } from "../middlewares/auth";
import { Acao, Role, Tabela } from "@prisma/client";
import { randomUUID } from "crypto";

import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import EmailService from "./email.service";
import auditService from "./audit.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

export default class UserService {
    //This class gets the data validated from the controller and executes on the db
    private readonly context: RequestContext;
    constructor(context: RequestContext) {
        //gets the infos of the logged user doing requests
        this.context = context;
    }

    public createMany = async (newUsers: DataCreateUser[]) => {
        await this.validateDuplicatesInOrganization(newUsers.map(({ email }) => email));

        const preparedUsers = await this.prepareUsersToCreate(newUsers);

        const _upsertedUsers = preparedUsers.map(({ id, role, name, email, encryptedPassword }) => {
            return prisma.user.upsert({
                include: { userRoles: { where: { empresaId: this.context.currentUserRole.empresaId } } },
                omit: { password: true },
                where: { email },
                update: {
                    name,
                    userRoles: { create: { role, empresaId: this.context.currentUserRole.empresaId } },
                },
                create: {
                    id,
                    name,
                    email,
                    password: encryptedPassword,
                    userRoles: {
                        create: {
                            role,
                            empresaId: this.context.currentUserRole.empresaId,
                        },
                    },
                },
            });
        });

        const userInfoToAudit = preparedUsers.map(({ encryptedPassword, password, ...restData }) => restData);
        const _auditNewUsers = auditService.createAudit({
            action: Acao.CREATE,
            table: Tabela.USUARIO,
            data: userInfoToAudit,
            context: this.context,
        });

        const [_, ...upsertedUsers] = await prisma.$transaction([_auditNewUsers, ..._upsertedUsers]);

        preparedUsers
            .filter(({ newUser }) => newUser)
            .map(({ email, password }) => EmailService.sendCredentials(email, password));

        return upsertedUsers;
    };

    public findManyBy = async (query: QueryFindUsers) => {
        const { gte_updatedAt, lte_updatedAt, role, name, email, id, bloqueado, ...where } = query.where ?? {};

        const users = await prisma.user.findMany({
            where: {
                id,
                name: name ? { contains: name, mode: "insensitive" } : undefined,
                email: email ? { contains: email, mode: "insensitive" } : undefined,
                updatedAt: { gte: gte_updatedAt, lte: lte_updatedAt },
                bloqueado: bloqueado === "true" ? true : bloqueado === "false" ? false : undefined,
                userRoles: {
                    some: { empresaId: this.context.currentUserRole.empresaId, role },
                    none:
                        where?.onlyComercialNotManagerRoles === "true"
                            ? { role: { in: [...NOT_COMERCIAL_ROLES, Role.COMERCIAL_MANAGER] } }
                            : undefined,
                },
                ativo: true,
            },
            omit: { password: true },
            include: { userRoles: { where: { empresaId: this.context.currentUserRole.empresaId, role } } },
            ...PrismaUtils.extractSortPageInfoFrom(query, "name", "asc"),
        });
        return users;
    };

    public getInfoByContext = async () => {
        return prisma.user.findUnique({
            where: { id: this.context.user.id, ativo: true },
            omit: { password: true },
            include: { userRoles: true },
        });
    };

    public getOneBy = async (id: string, query?: QueryGetOneUser) => {
        return prisma.user.findUnique({
            where: {
                id,
                ativo: true,
                userRoles: {
                    some: { empresaId: this.context.currentUserRole.empresaId },
                    none:
                        query?.onlyComercialNotManagerRoles === "true"
                            ? { role: { in: [...NOT_COMERCIAL_ROLES, Role.COMERCIAL_MANAGER] } }
                            : undefined,
                },
            },
            omit: { password: true },
            include: { userRoles: { where: { empresaId: this.context.currentUserRole.empresaId } } },
        });
    };

    public updateRoles = async (userId: string, updateRolesData: DataUpdateUserRoles, query?: QueryUpdateUserRoles) => {
        await this.validateIfExistAndReturn(userId, query?.onlyComercialNotManagerRoles);
        let roles = updateRolesData.userRoles.map(({ role }) => role);

        if (!roles.includes(Role.ADMIN)) await this.validateUniqueAdmin(userId);

        if (!roles.includes(Role.VENDEDOR)) roles = roles.concat([Role.VENDEDOR]);
        const _deletedUserRoles = prisma.userRole.deleteMany({
            where: {
                userId,
                empresaId: this.context.currentUserRole.empresaId,
                role: { notIn: roles },
            },
        });
        const _updateOrCreate = updateRolesData.userRoles.map(({ role, fixedCommission }) =>
            prisma.userRole.upsert({
                where: {
                    userId_empresaId_role: { userId, empresaId: this.context.currentUserRole.empresaId, role },
                },
                update: { fixedCommission: fixedCommission ?? false },
                create: {
                    empresaId: this.context.currentUserRole.empresaId,
                    userId,
                    role,
                    fixedCommission: fixedCommission ?? false,
                },
            })
        );

        const _audit = auditService.createAudit({
            action: Acao.UPDATE,
            table: Tabela.PAPEL_USUARIO,
            data: [{ id: userId, ...updateRolesData }],
            context: this.context,
        });

        const [_, ...updateOrCreateResults] = await prisma.$transaction([
            _deletedUserRoles,
            ..._updateOrCreate,
            _audit,
        ]);
        return updateOrCreateResults;
    };

    public updateInfo = async (userId: string, userInfoData: DataUpdateUserInfo, query?: QueryUpdateUserInfo) => {
        await this.validateIfExistAndReturn(userId, query?.onlyComercialNotManagerRoles);
        await this.validateDuplicates([userInfoData.email], userId);

        const _updatedUser = prisma.user.update({
            where: { id: userId, userRoles: { some: { empresaId: this.context.currentUserRole.empresaId } } },
            data: {
                email: userInfoData.email,
                name: userInfoData.name,
                password: userInfoData.bloqueado
                    ? "$2b$08$S7kyov9vQO8fWUNxThBKeeQvLGOuMHeiBOceNTg3tzmZ.rhpjDGrq"
                    : undefined,
                bloqueado: userInfoData.bloqueado,
            },
            omit: { password: true },
        });

        const dataToAudit = {
            id: userId,
            name: userInfoData.name,
            email: userInfoData.email,
            bloqueado: userInfoData.bloqueado,
        };
        const _auditEntry = auditService.createAudit({
            action: Acao.UPDATE,
            table: Tabela.USUARIO,
            data: [dataToAudit],
            context: this.context,
        });

        const [updatedUser, _] = await prisma.$transaction([_updatedUser, _auditEntry]);
        return updatedUser;
    };

    public deleteOneBy = async (userId: string, query: QueryDeleteUser) => {
        const user = await this.validateIfExistAndReturn(userId, query.onlyComercialNotManagerRoles);
        await this.validateUniqueAdmin(userId);

        const userRoles = await prisma.userRole.findMany({
            where: {
                userId,
                empresaId: this.context.currentUserRole.empresaId,
            },
        });

        const userRoleIds = userRoles.map((role) => role.id);

        // Para desativar participante com comissões pagas, somente se todas as comissões que ele tem estiverem pagas
        const unpaidCommission = await prisma.comissao.findFirst({
            where: { userRoleId: { in: userRoleIds }, comissaoPaga: false },
        });
        if (unpaidCommission) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "O usuário possui comissões não pagas e não pode ser desativado."
            );
        }

        // Busca todas as vendas onde o usuário está envolvido em QUALQUER papel
        const vendasDoUsuario = await prisma.venda.findMany({
            where: {
                empresaId: this.context.currentUserRole.empresaId,
                OR: [
                    { accountManagerId: { in: userRoleIds } },
                    { comercialManagerId: { in: userRoleIds } },
                    { insideSalesId: { in: userRoleIds } },
                    { referrerId: { in: userRoleIds } },
                    { comercialAssistantId: { in: userRoleIds } },
                    { solutionArchitectId: { in: userRoleIds } },
                ],
            },
        });

        const vendasComoVendedor = vendasDoUsuario.filter((v) => userRoleIds.includes(v.accountManagerId || ""));

        const vendasComoGerenteComercial = vendasDoUsuario.filter((v) =>
            userRoleIds.includes(v.comercialManagerId || "")
        );

        // Busca um Administrador para reassociar as vendas
        let adminRole: { id: string } | null = null;

        // Se houver vendas que precisam de reassociação (como vendedor ou gerente comercial)
        if (vendasComoVendedor.length > 0 || vendasComoGerenteComercial.length > 0) {
            const adminRoleResult = await prisma.userRole.findFirst({
                where: {
                    role: Role.ADMIN,
                    empresaId: this.context.currentUserRole.empresaId,
                    ativo: true,
                    user: {
                        ativo: true,
                        id: { not: userId },
                    },
                },
                select: { id: true },
            });

            if (adminRoleResult) {
                adminRole = adminRoleResult;
            }
        }

        const transactions: any[] = [];

        // Remove as distribuições do usuário
        transactions.push(
            prisma.roleCommission.deleteMany({
                where: { userRoleId: { in: userRoleIds } },
            })
        );

        // Apaga as comissões do usuário
        transactions.push(
            prisma.comissao.deleteMany({
                where: { userRoleId: { in: userRoleIds } },
            })
        );

        if (vendasComoVendedor.length > 0) {
            const vendasComGerenteComercial = vendasComoVendedor.filter((v) => v.comercialManagerId);
            const vendasSemGerenteComercial = vendasComoVendedor.filter((v) => !v.comercialManagerId);

            // Para vendas COM Gerente Comercial: apenas remove o Vendedor
            if (vendasComGerenteComercial.length > 0) {
                transactions.push(
                    prisma.venda.updateMany({
                        where: { id: { in: vendasComGerenteComercial.map((v) => v.id) } },
                        data: {
                            accountManagerId: null,
                        },
                    })
                );
            }

            // Para vendas SEM Gerente Comercial: atribui a um Administrador como Gerente Comercial
            if (vendasSemGerenteComercial.length > 0) {
                if (adminRole) {
                    transactions.push(
                        prisma.venda.updateMany({
                            where: { id: { in: vendasSemGerenteComercial.map((v) => v.id) } },
                            data: {
                                accountManagerId: null,
                                comercialManagerId: adminRole.id,
                            },
                        })
                    );
                } else {
                    // Se não encontrou administrador, apenas remove o vendedor
                    transactions.push(
                        prisma.venda.updateMany({
                            where: { id: { in: vendasSemGerenteComercial.map((v) => v.id) } },
                            data: {
                                accountManagerId: null,
                            },
                        })
                    );
                }
            }
        }

        if (vendasComoGerenteComercial.length > 0) {
            if (adminRole) {
                // Atribui o Administrador como novo Gerente Comercial
                transactions.push(
                    prisma.venda.updateMany({
                        where: { id: { in: vendasComoGerenteComercial.map((v) => v.id) } },
                        data: {
                            comercialManagerId: adminRole.id,
                        },
                    })
                );
            } else {
                const outroGerenteComercial = await prisma.userRole.findFirst({
                    where: {
                        role: Role.COMERCIAL_MANAGER,
                        empresaId: this.context.currentUserRole.empresaId,
                        ativo: true,
                        user: {
                            ativo: true,
                            id: { not: userId },
                        },
                    },
                    select: { id: true },
                });

                if (outroGerenteComercial) {
                    transactions.push(
                        prisma.venda.updateMany({
                            where: { id: { in: vendasComoGerenteComercial.map((v) => v.id) } },
                            data: {
                                comercialManagerId: outroGerenteComercial.id,
                            },
                        })
                    );
                } else {
                    // Se não encontrou nem Admin nem outro Gerente Comercial, escreve uma string vazia
                    transactions.push(
                        prisma.venda.updateMany({
                            where: { id: { in: vendasComoGerenteComercial.map((v) => v.id) } },
                            data: {
                                comercialManagerId: "null",
                            },
                        })
                    );
                }
            }
        }

        transactions.push(
            prisma.venda.updateMany({
                where: {
                    empresaId: this.context.currentUserRole.empresaId,
                    OR: [
                        { insideSalesId: { in: userRoleIds } },
                        { referrerId: { in: userRoleIds } },
                        { comercialAssistantId: { in: userRoleIds } },
                        { solutionArchitectId: { in: userRoleIds } },
                    ],
                },
                data: {
                    insideSalesId: null,
                    referrerId: null,
                    comercialAssistantId: null,
                    solutionArchitectId: null,
                },
            })
        );

        transactions.push(
            prisma.user.update({
                where: { id: user.id },
                data: {
                    ativo: false,
                    email: "_disabled_" + user.email,
                    password: "$2b$08$S7kyov9vQO8fWUNxThBKeeQvLGOuMHeiBOceNTg3tzmZ.rhpjDGrq",
                    userRoles: {
                        updateMany: {
                            where: { empresaId: this.context.currentUserRole.empresaId },
                            data: { ativo: false },
                        },
                    },
                },
            })
        );

        const auditData = { id: user.id, ativo: false };
        transactions.push(
            auditService.createAudit({
                action: Acao.DELETE,
                table: Tabela.USUARIO,
                data: [auditData],
                context: this.context,
            })
        );

        await prisma.$transaction(transactions);
        return;
    };

    public findAllRolesInUsers = async (usersIds: string[], role?: Role) => {
        const uniqueUsersIds = [...new Set(usersIds)];

        const users = await prisma.user.findMany({
            where: {
                id: { in: uniqueUsersIds },
                userRoles: {
                    some: {
                        role: role,
                        empresaId: this.context.currentUserRole.empresaId,
                    },
                },
            },
            omit: { password: true },
            include: { userRoles: { where: { empresaId: this.context.currentUserRole.empresaId, role } } },
        });

        return users;
    };

    public static getOneByEmail = async (email: string) => {
        return prisma.user.findUnique({
            where: { email, ativo: true },
            include: { userRoles: { orderBy: { role: "asc" } } },
        });
    };

    public static getUserIdMappedByEmail = async (userEmails: string[]) => {
        const users = await prisma.user.findMany({
            select: { id: true, email: true },
            where: { email: { in: userEmails } },
        });
        return users.reduce((acc, user) => ({ ...acc, [user.email]: user.id }), {} as Record<string, string>);
    };

    private validateDuplicatesInOrganization = async (emails: string[]) => {
        const user = await prisma.user.findFirst({
            where: {
                email: { in: emails },
                userRoles: { some: { empresaId: this.context.currentUserRole.empresaId } },
            },
        });

        if (user) throw new ApiError(httpStatus.BAD_REQUEST, `O email ${user.email} já está cadastrado.`);
    };

    private validateDuplicates = async (emails: string[], userIdUpdating?: string) => {
        const user = await prisma.user.findFirst({
            where: {
                email: { in: emails },
                id: { not: userIdUpdating },
            },
        });

        if (user) throw new ApiError(httpStatus.BAD_REQUEST, `O email ${user.email} já está cadastrado.`);
    };

    private prepareUsersToCreate = async (users: DataCreateUser[]) => {
        const existUsers = await prisma.user.findMany({
            where: {
                email: { in: users.map((user) => user.email) },
                userRoles: { every: { empresaId: { not: this.context.currentUserRole.empresaId } } },
            },
        });

        const usersPrepared: (DataCreateUser & {
            id: string;
            password: string;
            encryptedPassword: string;
            newUser: boolean;
        })[] = [];

        for (const user of users) {
            const password = generateRandomPassword();
            const encryptedPassword = await encryptPassword(password);

            const existUser = existUsers.find((existUser) => existUser.email === user.email);
            if (existUser)
                usersPrepared.push({ ...user, id: existUser.id, password, encryptedPassword, newUser: false });
            else usersPrepared.push({ ...user, id: randomUUID(), password, encryptedPassword, newUser: true });
        }

        return usersPrepared;
    };

    private validateIfExistAndReturn = async (userId: string, onlyComercialNotManagerRoles?: "true" | "false") => {
        const user = await this.getOneBy(userId, { onlyComercialNotManagerRoles });

        if (!user) throw new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado.");

        return user;
    };

    private validateUniqueAdmin = async (userId: string) => {
        const admins = await prisma.userRole.findMany({
            where: { role: Role.ADMIN, user: { ativo: true }, empresaId: this.context.currentUserRole.empresaId },
        });
        if (admins.length === 1 && admins[0].userId === userId) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Esta ação deixaria o sistema sem administrador, portanto não é possível."
            );
        }
    };
}
