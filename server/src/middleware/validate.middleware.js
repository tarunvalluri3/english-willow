import { ZodError } from "zod";

import ApiError from "../common/ApiError.js";

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join(-1),
          message: issue.message,
        }));

        return next(
          new ApiError(
            400,
            "Validation failed",
            errors
          )
        );
      }

      next(error);
    }
  };
};

export default validate;