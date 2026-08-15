import { Role } from "@prisma/client";

export default class UserRoleUtils {
    public static getRoleDescription(role: Role): string {
        switch (role) {
            case Role.ADMIN:
                return "Administrador";
            case Role.COMERCIAL_ASSISTANT:
                return "Assistente Comercial";
            case Role.COMERCIAL_MANAGER:
                return "Gerente Comercial";
            case Role.COMMISSIONING_ANALYST:
                return "Analista de Comissão";
            case Role.REFERRER:
                return "Indicador Comercial";
            case Role.SOLUTION_ARCHITECT:
                return "Arquiteto de Soluções";
            case Role.VENDEDOR:
                return "Vendedor";
            default:
                return "Invalid Role";
        }
    }
}
