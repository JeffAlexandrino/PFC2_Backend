import CategoryService from "../services/category.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";

import { fnSubject } from "../config/abilities";
import { ForbiddenError } from "@casl/ability";

import * as T from "../types/category.types";

export default class CategoryController {
    public static createMany = catchAsync(async (req, res) => {
        const categoryService = new CategoryService(req.context);

        const validRequest = req as unknown as T.ValidCreateCategories;
        const newCategoriesData = validRequest.body.data;

        for (const newCategoryData of newCategoriesData) {
            ForbiddenError.from(req.context.userAbilities).throwUnlessCan(
                "create",
                fnSubject("Categoria", { ...newCategoryData })
            );
        }

        const createdCategories = await categoryService.createMany(validRequest.body.data);
        res.status(httpStatus.CREATED).send(createdCategories);
    });

    public static findMany = catchAsync(async (req, res) => {
        const categoryService = new CategoryService(req.context);

        const validRequest = req as unknown as T.ValidFindCategories;
        const where = validRequest.query.where;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Categoria", { ...where }));

        const categories = await categoryService.findManyBy(validRequest.query);
        res.send(categories);
    });

    public static getOne = catchAsync(async (req, res) => {
        const categoryService = new CategoryService(req.context);

        const validRequest = req as unknown as T.ValidGetCategory;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("read", fnSubject("Categoria", { ...params }));

        const category = await categoryService.getOneBy(params.id);
        if (!category) throw new ApiError(httpStatus.NOT_FOUND, "Categoria não encontrada.");

        res.send(category);
    });

    public static updateOne = catchAsync(async (req, res) => {
        const categoryService = new CategoryService(req.context);

        const validRequest = req as unknown as T.ValidUpdateCategory;
        const params = { ...validRequest.body.data, ...validRequest.params };

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("update", fnSubject("Categoria", { ...params }));

        const updateCategoryProps = { id: params.id, ...validRequest.body.data };

        const updatedCategory = await categoryService.updateOne(updateCategoryProps);
        res.send(updatedCategory);
    });

    public static deleteOne = catchAsync(async (req, res) => {
        const categoryService = new CategoryService(req.context);

        const validRequest = req as unknown as T.ValidDeleteCategory;
        const params = validRequest.params;

        ForbiddenError.from(req.context.userAbilities).throwUnlessCan("delete", fnSubject("Categoria", { ...params }));

        await categoryService.deleteOneBy(params.id);
        res.status(httpStatus.NO_CONTENT).send();
    });
}
