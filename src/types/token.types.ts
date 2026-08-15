import { Prisma } from "@prisma/client";
import { Moment } from "moment";

const tokenWithCurrentUserRole = Prisma.validator<Prisma.TokenDefaultArgs>()({ include: { currentUserRole: true } });
export type TokenWithCurrentUserRole = Prisma.TokenGetPayload<typeof tokenWithCurrentUserRole>;

export type TokenPayload = {
    sub: string;
    iat: number;
    exp: number;
    tokenId: string;
};

export type GenerateTokenProps = {
    userId: string;
    expires: Moment;
    tokenId: string;
};

export type GenerateAuthTokenProps = { userId: string; currentRoleId: string };

export type AuthTokens = {
    access: { token: string; expires: Date };
    refresh?: { token: string; expires: Date };
};
