import { Request, Response } from "express";
import * as productService from "./product.service";

export const getProducts = async (req: Request, res: Response) => {
  const { categoryId, search } = req.query;
  const products = await productService.getProducts({
    categoryId: categoryId as string,
    search: search as string,
  });
  res.json(products);
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await productService.getProductById(id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

export const createProduct = async (req: Request, res: Response) => {
  const data = req.body;
  const product = await productService.createProduct(data);
  res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const product = await productService.updateProduct(id, data);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  await productService.deleteProduct(id);
  res.status(204).send();
};
