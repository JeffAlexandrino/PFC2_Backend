require("dotenv").config();
import "jest-extended";

describe("Enviroments", () => {
    it("Deveria ter configuradas todas as variaveis de ambiente", async () => {
        const NODE_ENV = process.env.NODE_ENV;

        const DATABASE_URL = process.env.DATABASE_URL;

        const JWT_SECRET = process.env.JWT_SECRET;
        const JWT_ACCESS_EXPIRATION_MINUTES = process.env.JWT_ACCESS_EXPIRATION_MINUTES;
        const JWT_REFRESH_EXPIRATION_DAYS = process.env.JWT_REFRESH_EXPIRATION_DAYS;

        expect(NODE_ENV).toBe("test");
        expect(DATABASE_URL).toBeDefined();

        expect(JWT_SECRET).toBeDefined();
        expect(JWT_ACCESS_EXPIRATION_MINUTES).toBeDefined();
        expect(JWT_REFRESH_EXPIRATION_DAYS).toBeDefined();
    });
});
