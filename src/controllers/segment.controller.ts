import SegmentService from "../services/segment.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import * as T from "../types/segment.types";

export default class SegmentController {
    public static createMany = catchAsync(async (req, res) => {
        const segmentService = new SegmentService(req.context);

        const validRequest = req as unknown as T.ValidCreateSegments;
        const newSegments = validRequest.body.data;

        for (const newSegment of newSegments) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
                "create",
                fnSubject("Segmento", { ...newSegment })
            );
        }

        const createdSegments = await segmentService.createMany(newSegments);
        res.status(httpStatus.CREATED).send(createdSegments);
    });

    public static findMany = catchAsync(async (req, res) => {
        const segmentService = new SegmentService(req.context);

        const validRequest = req as unknown as T.ValidFindSegments;
        const where = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Segmento", { ...where }));

        const result = await segmentService.findManyBy(validRequest.query);
        res.send(result);
    });

    public static getOne = catchAsync(async (req, res) => {
        const segmentService = new SegmentService(req.context);

        const validRequest = req as unknown as T.ValidGetSegment;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Segmento", { ...params }));

        const segment = await segmentService.getOneBy(params.id);
        if (!segment) throw new ApiError(httpStatus.NOT_FOUND, "Segmento não encontrado.");

        res.send(segment);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const segmentService = new SegmentService(req.context);

        const validRequest = req as unknown as T.ValidUpdateSegment;
        const params = { ...validRequest.params, ...validRequest.body.data };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Segmento", { ...params }));
        const editSegmentData = { id: params.id, ...validRequest.body.data };

        const updatedSegment = await segmentService.updateOne(editSegmentData);
        res.send(updatedSegment);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const segmentService = new SegmentService(req.context);

        const validRequest = req as unknown as T.ValidDeleteSegment;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("delete", fnSubject("Segmento", { ...params }));

        await segmentService.deleteOneBy(params.id);
        res.status(httpStatus.NO_CONTENT).send();
    });
}
