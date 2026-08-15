import VisitController from "../controllers/visit.controller";
import VisitValidator from "../validations/visit.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();
router
    .route("/")
    .post(auth(), yupValidate(VisitValidator.createVisits), VisitController.createMany)
    .get(auth(), yupValidate(VisitValidator.findVisits), VisitController.findMany)
    .patch(auth(), yupValidate(VisitValidator.updateVisitsStatusPaid), VisitController.payMany);

router
    .route(ApiRoutes.getExpenseRoleVisits())
    .get(
        auth(),
        yupValidate(VisitValidator.findTotalVisitExpensesBySalePersonRole),
        VisitController.getInfoExpensesPerRole
    );

router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(VisitValidator.getVisit), VisitController.getOne)
    .patch(auth(), yupValidate(VisitValidator.updateVisit), VisitController.updateOne)
    .delete(auth(), yupValidate(VisitValidator.deleteVisit), VisitController.deleteOne);

export default router;
