import dotenv from "dotenv";
import path from "path";
import yup from "./yup";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const envSchema = yup.object({
    NODE_ENV: yup.mixed<string>().oneOf(["production", "development", "test"]).required(),
    PORT: yup.number().default(3000),
    JWT_SECRET: yup.string().required(),
    JWT_ACCESS_EXPIRATION_MINUTES: yup.number().default(30),
    JWT_REFRESH_EXPIRATION_DAYS: yup.number().default(7),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: yup.number().default(10),
    SMTP_HOST: yup.string(),
    SMTP_PORT: yup.number(),
    SMTP_USERNAME: yup.string(),
    SMTP_PASSWORD: yup.string(),
    EMAIL_FROM: yup.string(),
});

const envVars = envSchema.validateSync(process.env);

export default {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    jwt: {
        secret: envVars.JWT_SECRET,
        accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
        refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
        resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    },
    email: {
        smtp: {
            host: envVars.SMTP_HOST,
            port: envVars.SMTP_PORT,
            secure: false,
            auth: {
                user: envVars.SMTP_USERNAME,
                pass: envVars.SMTP_PASSWORD,
            },
        },
        from: envVars.EMAIL_FROM,
    },
};
