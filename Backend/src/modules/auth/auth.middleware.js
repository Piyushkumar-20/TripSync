import ApiError from "../../common/utils/api-error.js";
import User from "../users/user.model.js";
import {verifyAccessToken} from "../../common/utils/jwt.utils.js";

const authenticate = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw ApiError.unauthorized("Not Authenticated");
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      throw ApiError.unauthorized("Not Authenticated");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized("Not Authenticated");
    }

    req.user = {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate
