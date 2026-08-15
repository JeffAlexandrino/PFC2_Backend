import auditController from "../controllers/audit.controller";
import AuditValidator from "../validations/audit.validator";
import auth from "../middlewares/auth";
import express from "express";

import { ValidFindAudit } from "../types/audit.types";
import { yupValidate } from "../middlewares/validate";
import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

const router = express.Router();

router.route("/").get(auth(), yupValidate(AuditValidator.findAudits), (req, res, next) => {
    try {
        const validReq = req as unknown as ValidFindAudit;
        const where = validReq.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Auditoria", { ...where }));
        auditController.findMany(req, res, next);
    } catch (error) {
        next(error);
    }
});

export default router;
