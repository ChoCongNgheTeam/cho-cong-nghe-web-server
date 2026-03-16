import * as pageRepository from "./page.repository";
import { NotFoundError } from "@/errors";

export const getPageBySlugPublic = async (slug: string) => {
  const page = await pageRepository.findBySlugPublic(slug);
  
  if (!page) {
    throw new NotFoundError("Trang tĩnh hoặc chính sách");
  }

  return page;
};