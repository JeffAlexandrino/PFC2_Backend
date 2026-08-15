import SegmentController from "../controllers/segment.controller";
import SegmentValidator from "../validations/segment.validator";
import auth from "../middlewares/auth";
import express from "express";

import { yupValidate } from "../middlewares/validate";
import { ApiRoutes } from "../../src/api-routes";

const router = express.Router();

router
    .route("/")
    .post(auth(), yupValidate(SegmentValidator.createSegments), SegmentController.createMany)
    .get(auth(), yupValidate(SegmentValidator.findSegments), SegmentController.findMany);
router
    .route(ApiRoutes.getIdRoute())
    .get(auth(), yupValidate(SegmentValidator.getSegment), SegmentController.getOne)
    .patch(auth(), yupValidate(SegmentValidator.updateSegment), SegmentController.updateOne)
    .delete(auth(), yupValidate(SegmentValidator.deleteSegment), SegmentController.deleteOne);

export default router;
