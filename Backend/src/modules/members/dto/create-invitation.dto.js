import Joi from "joi";
import BaseDto from "../../../common/dto/base-dto.js";

class CreateInvitationDto extends BaseDto {
  static schema = Joi.object({
    email: Joi.string().trim().lowercase().email().required().messages({
      "string.email": "Enter a valid email address.",
      "string.empty": "Email is required.",
      "any.required": "Email is required.",
    }),
    role: Joi.string().valid("Viewer", "Editor").required().messages({
      "any.only": "Select a valid role.",
      "any.required": "Role is required.",
    }),
  });
}

export default CreateInvitationDto;
