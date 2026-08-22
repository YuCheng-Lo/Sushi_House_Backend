import type { RequestHandler } from "express";
import * as z from "zod";

export const validateBody = <T extends z.ZodType>(
  schema: T,
): RequestHandler => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export const validateParams = <T extends z.ZodType>(
  schema: T,
): RequestHandler => {
  return (req, res, next) => {
    try {
      schema.parse(req.params);
      next();
    } catch (err) {
      next(err);
    }
  };
};

export const validateQuery = <T extends z.ZodType>(
  schema: T,
): RequestHandler => {
  return (req, res, next) => {
    try {
      schema.parse(req.query);
      next();
    } catch (err) {
      next(err);
    }
  };
};
