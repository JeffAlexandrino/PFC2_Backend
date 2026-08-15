import { FindQueryProps } from "../types/commom.types";

type SortPageInfo = {
    orderBy: { [x: string]: "asc" | "desc" } | undefined;
    take: number | undefined;
    skip: number | undefined;
};

export default class PrismaUtils {
    public static extractSortPageInfoFrom<Where, Sort extends string>(
        query: FindQueryProps<Where, Sort>,
        sortByDefault?: Sort,
        sortTypeDefault?: "asc" | "desc"
    ): SortPageInfo {
        const page = query.page;
        const limit = query.limit;
        const sortBy = query.sortBy ?? sortByDefault;
        const sortType = query.sortType ?? sortTypeDefault ?? "asc";

        return {
            orderBy: sortBy ? { [sortBy]: sortType } : undefined,
            take: limit,
            skip: page !== undefined && limit !== undefined ? page * limit : undefined,
        };
    }
}
