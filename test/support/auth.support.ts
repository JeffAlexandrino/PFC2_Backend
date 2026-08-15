import AuthService from "../../src/services/auth.service";
import ApiError from "../../src/utils/apiError";
import SeedSupport from "./seed.support";

import { DEFAULT_PASSWORD, superUser } from "../../prisma/seeds/models/user";
import { organizationA } from "../../prisma/seeds/models/organization";
import { tokenService } from "../../src/services";
import { Role } from "@prisma/client";

export default class AuthSupport {
    private static async getAuthorization(email: string, password: string, preferenceRole?: Role) {
        const user = await AuthService.getUserBy(email, password);

        const firstUserRole = user.userRoles.at(0);
        if (!firstUserRole) throw new ApiError(400, "User has no roles");

        const preferencedRole = user.userRoles.find(
            (userRole) => userRole.empresaId === organizationA.id && userRole.role === preferenceRole
        );
        const tokens = await tokenService.generateAuthToken({
            userId: user.id,
            currentRoleId: preferencedRole?.id ?? firstUserRole?.id,
        });
        return tokens;
    }

    public static async getRoleAuthFromUserWithUniqueRole(role: Role) {
        return await this.getAuthorization(SeedSupport.getUserWithUniqueRoleBy(role).email, DEFAULT_PASSWORD, role);
    }

    public static async getRoleAuthFromUserWithMultipleRoles(role: Role) {
        return await this.getAuthorization(superUser.email, DEFAULT_PASSWORD, role);
    }
}
