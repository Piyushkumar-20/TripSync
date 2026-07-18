import Joi from "joi";
import BaseDto from "../../../common/dto/base-dto.js";

class GoogleLoginDto extends BaseDto {
  static schema = Joi.object({
    idToken: Joi.string().trim(),
    accessToken: Joi.string().trim(),
  })
    .or("idToken", "accessToken")
    .messages({
      "object.missing": "Google token is required.",
    });
}

export default GoogleLoginDto;
