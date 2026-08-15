import { ValidFindAudit } from "../types/audit.types";

import auditService from "../services/audit.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

const findMany = catchAsync(async (req, res) => {
    const validRequest = req as unknown as ValidFindAudit;

    const result = await auditService.queryAudit(validRequest.query, req.context);
    if (!result) throw new ApiError(httpStatus.NOT_FOUND, "Auditoria não encontrada.");

    res.send(result);
});

export default { findMany };
