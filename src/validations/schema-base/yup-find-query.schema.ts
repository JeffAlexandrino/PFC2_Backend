import yup from "../../config/yup";

import { AnyObject } from "yup";

export default function yupFindQuerySchema<WhereObject extends AnyObject, SortByValue extends string>(
    whereObject: WhereObject,
    possiblesValues: SortByValue[]
) {
    return yup
        .object({
            sortBy: yup.mixed<SortByValue>().oneOf(possiblesValues),
            sortType: yup.mixed<"asc" | "desc">().oneOf(["asc", "desc"]),
            limit: yup.number().integer("A query 'limit' deve ser do tipo (number | undefined)."),
            page: yup.number().integer("A query 'page' deve ser do tipo (number | undefined)."),
            where: yup.object(whereObject).noUnknown(true).strict(),
        })
        .noUnknown(true)
        .strict();
}
