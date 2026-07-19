import ApiError from "../utils/api-error.js";

const validate = (Dtoclass) => {
  return (req, res, next) => {
    try {
      const { value, error } = Dtoclass.validate(req.body);
      if (error) {
        throw ApiError.badRequest(
          error.details.map((err) => err.message).join("; "),
        );
      }
      req.body = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};
export default validate;
