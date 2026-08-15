export type IntervalDateType = { startDate: Date; endDate: Date };

export type FindQueryProps<WhereProps, SortBy extends string> = {
    limit?: number;
    page?: number;
    sortBy?: SortBy;
    sortType?: "asc" | "desc";
    where?: WhereProps;
};
