import { Request, Response } from "express";
import * as categoryService from "./category.service";

export const getCategories = async (req: Request, res: Response) => {
  const categories = await categoryService.getCategories();
  res.json(categories);
};

export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await categoryService.getCategoryById(id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json(category);
};

export const createCategory = async (req: Request, res: Response) => {
  const data = req.body;
  const category = await categoryService.createCategory(data);
  res.status(201).json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const category = await categoryService.updateCategory(id, data);
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json(category);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  await categoryService.deleteCategory(id);
  res.status(204).send();
};
