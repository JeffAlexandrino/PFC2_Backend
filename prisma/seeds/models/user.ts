import { User } from "@prisma/client";

type UserData = Pick<User, "id" | "name" | "email">;

export const DEFAULT_PASSWORD = "123";

export const monitor: UserData = {
    id: "monitor",
    name: "Usuario Monitor",
    email: "monitor@monitor.com",
};

export const admin: UserData = {
    id: "admin",
    name: "Roberto Carlos Administrador",
    email: "administrador@adminitrador.com",
};

export const commissioningAnalyst: UserData = {
    id: "commissioningAnalyst",
    name: "Tim Maia Comissioning Analyst",
    email: "commissioningAnalyst@commissioningAnalyst.com",
};

export const comercialManager: UserData = {
    id: "comercialManager",
    name: "Cartola Comercial Manager",
    email: "comercialManager@comercialManager.com",
};

export const comercialAssistant: UserData = {
    id: "comercialAssistant",
    name: "Djavan Comercial Assistant",
    email: "comercialAssistant@comercialAssistant.com",
};

export const solutionArchitect: UserData = {
    id: "solutionArchitect",
    name: "Roberto Carlos Solution Architect",
    email: "solutionArchitect@solutionArchitect.com",
};

export const referrer: UserData = {
    id: "referrer",
    name: "Tom Jobim Referrer",
    email: "referrer@referrer.com",
};

export const salePersonA: UserData = {
    id: "salePersonA",
    name: "Alcione Sale Person A",
    email: "salePersonA@salePersonA.com",
};

export const salePersonB: UserData = {
    id: "salePersonB",
    name: "Arnaldo Cruz Sale Person B",
    email: "salePersonB@salePersonB.com",
};

export const deletedUser: UserData = {
    id: "deletedUser",
    name: "Deleted User",
    email: "deletedUser@deletedUser.com",
};

export const userWihoutRoles: UserData = {
    id: "userWithoutRoles",
    name: "User Without Roles",
    email: "userWithoutRoles@userWithoutRoles.com",
};

export const superUser: UserData = {
    id: "superUser",
    name: "Pelé Super User",
    email: "superUser@superUser.com",
};

export const financialManagerUser: UserData = {
    id: "financialManagerUser",
    name: "Edward Elric Financial Manager",
    email: "financialManagerUser@financialUser.com",
};