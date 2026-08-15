import { errorConverter, errorHandler } from "./middlewares/error";
import { reqInterceptor } from "./middlewares/reqInterceptor";
import { authLimiter } from "./middlewares/rateLimit";
import { jwtStrategy } from "./config/passport";
import { ApiRoutes } from "./api-routes";

import httpStatus from "./utils/httpStatus";
import ApiError from "./utils/apiError";
import compression from "compression";
import config from "./config/config";
import passport from "passport";
import routes from "./routes";
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";

dotenv.config();
const server = express();

// set security HTTP headers
server.use(helmet());

//gzip compression
server.use(compression());

// parse json request body
server.use(express.json({ limit: "5mb" }));

// parse to json query params
server.set("query parser", "extended");

// enable cors
server.use(cors());
server.options("*path", cors());

// jwt authentication
server.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === "production") {
    server.use("/auth", authLimiter);
}

server.use(reqInterceptor);

//v api routes
export const API_PORT = process.env.PORT ?? 8000;

server.use(ApiRoutes.getRouteVersion(), routes);

// send back a 404 error for any unknown api request
server.use((_req, _res, next) => {
    console.log("Rota Req Erro:", _req.path);
    next(new ApiError(httpStatus.NOT_FOUND, "Essa rota não existe."));
});

// convert error to ApiError, if needed
server.use(errorConverter);

// handle error
server.use(errorHandler);

export default server;
