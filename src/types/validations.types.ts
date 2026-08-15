export type FindSchema<WhereProps, SortKeys extends string> = {
    query?: {
        sortBy?: SortKeys;
        sortType?: "asc" | "desc";
        limit?: number;
        page?: number;
        where?: WhereProps;
    };
};
