import { ApiRoutes } from "../../src/api-routes";

import catchAsync from "../utils/catchAsync";
import express from "express";

const router = express.Router();

router.route("/").get(
    catchAsync((_, res) => {
        res.status(200).send(ApiRoutes.getVersion);
    })
);

export default router;
