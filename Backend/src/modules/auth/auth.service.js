import crypto from "crypto";
import ApiError from "../../common/utils/api-error.js";
import User from "../users/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.utils.js";

import {
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "../../common/config/email.js";
import { OAuth2Client } from "google-auth-library";
import { ensureFreeSubscription } from "../subscription/subscription.service.js";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const client = new OAuth2Client(googleClientId);

const assertGoogleAuthConfigured = () => {
  if (!googleClientId) {
    throw ApiError.badGateway("Google login is not configured.");
  }
};

// Hash the refreshtoken before storing in DB
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.emailVerificationToken;
  delete userObj.emailVerificationTokenExpires;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordTokenExpires;
  return userObj;
};

const getGooglePayloadFromAccessToken = async (accessToken) => {
  assertGoogleAuthConfigured();

  const tokenInfoUrl = new URL("https://www.googleapis.com/oauth2/v3/tokeninfo");
  tokenInfoUrl.searchParams.set("access_token", accessToken);

  const tokenInfoResponse = await fetch(tokenInfoUrl);
  const tokenInfo = await tokenInfoResponse.json().catch(() => null);

  if (
    !tokenInfoResponse.ok ||
    tokenInfo?.aud !== googleClientId
  ) {
    throw ApiError.unauthorized("Invalid Google token");
  }

  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw ApiError.unauthorized("Invalid Google token");
  }

  return await response.json();
};

const getGooglePayload = async ({ idToken, accessToken }) => {
  assertGoogleAuthConfigured();

  if (idToken) {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,
      });

      return ticket.getPayload();
    } catch {
      throw ApiError.unauthorized("Invalid Google token");
    }
  }

  if (accessToken) {
    return await getGooglePayloadFromAccessToken(accessToken);
  }

  throw ApiError.badRequest("Google token is required");
};

const register = async ({ fullName, email, password }) => {
  const exist = await User.findOne({ email });
  if (exist) {
    throw ApiError.conflict("User already Exist");
  }

  const { rawToken, hashedToken } = generateVerificationToken();

  const user = await User.create({
    fullName,
    email,
    password,
    isEmailVerified: false,
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: Date.now() + 15 * 60 * 1000,
  });

  await ensureFreeSubscription(user._id);
  try {
    await sendVerificationEmail(email, rawToken);
  } catch {
    try {
      await User.deleteOne({ _id: user._id });
    } catch {
      throw ApiError.badGateway(
        "Unable to send verification email. Please try again later.",
      );
    }

    throw ApiError.badGateway(
      "Unable to send verification email. Please try again later.",
    );
  }

  return sanitizeUser(user);
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid Email or Password");
  }

  if (user.provider === "local" && !user.isEmailVerified) {
    throw ApiError.badRequest("Please verify your email before logging in.");
  }

  const verifyPassword = await user.comparePassword(password);
  if (!verifyPassword) {
    throw ApiError.unauthorized("Invalid Email or Password");
  }

  const refreshToken = generateRefreshToken({ id: user._id });
  const accessToken = generateAccessToken({ id: user._id });

  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  await ensureFreeSubscription(user._id);

  return { user: sanitizeUser(user), refreshToken, accessToken };
};

/* JWTs are stateless. Once issued, there's no way to revoke them — they're valid until they expire.
so we asign a Accesstoken for less time and refresh time just generate new access token. 
So that user do not have to login in every 15 min 
*/
const refresh = async (token) => {
  if (!token) {
    throw ApiError.unauthorized("Invalid Token");
  }

  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user) {
    throw ApiError.unauthorized("User no longer Exist");
  }

  if (user.refreshToken !== hashToken(token)) {
    throw ApiError.unauthorized("Invalid Token");
  }

  const newRefreshToken = generateRefreshToken({ id: user._id });
  const accessToken = generateAccessToken({ id: user._id });

  user.refreshToken = hashToken(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const forgetPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.unauthorized("User does not exist");
  }

  const { rawToken, hashedToken } = generateVerificationToken();
  user.resetPasswordToken = hashedToken;
  user.resetPasswordTokenExpires = Date.now() + 15 * 60 * 1000; // expires in 15 min
  await user.save();

  try {
    await sendResetPasswordEmail(email, rawToken);
  } catch {}
};

const verifyEmail = async (token) => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: { $gt: Date.now() },
  }).select("+emailVerificationToken +emailVerificationTokenExpires");

  if (!user) {
    throw ApiError.badRequest("Invalid or expired verification token");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpires = undefined;

  await user.save({ validateBeforeSave: false });

  return sanitizeUser(user);
};

const resendVerificationEmail = async (email) => {
  const user = await User.findOne({ email }).select(
    "+emailVerificationToken +emailVerificationTokenExpires",
  );

  if (!user) {
    throw ApiError.badRequest("User does not exist");
  }

  if (user.isEmailVerified) {
    throw ApiError.conflict("Email is already verified");
  }

  const { rawToken, hashedToken } = generateVerificationToken();
  const previousToken = user.emailVerificationToken;
  const previousTokenExpires = user.emailVerificationTokenExpires;

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpires = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationEmail(user.email, rawToken);
  } catch {
    user.emailVerificationToken = previousToken;
    user.emailVerificationTokenExpires = previousTokenExpires;
    await user.save({ validateBeforeSave: false });
    throw ApiError.badGateway(
      "Unable to send verification email. Please try again later.",
    );
  }

  return true;
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordTokenExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordTokenExpires");

  if (!user) {
    throw ApiError.unauthorized("No User found");
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpires = undefined;

  await user.save();
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.unauthorized("User does not exist");
  }
  return sanitizeUser(user);
};

const googleLogin = async ({ idToken, accessToken: googleAccessToken }) => {
  const payload = await getGooglePayload({
    idToken,
    accessToken: googleAccessToken,
  });

  const { sub: googleId, email, name, picture, email_verified } = payload;

  if (!email_verified) {
    throw ApiError.unauthorized("Google email is not verified");
  }

  let user = await User.findOne({ email }).select("+refreshToken");

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString("hex");

    user = await User.create({
      fullName: name,
      email,
      password: randomPassword,
      provider: "google",
      googleId,
      avatar: picture,
      isEmailVerified: true,
    });

    await ensureFreeSubscription(user._id);
  } else if (!user.provider || user.provider === "local") {
    user.provider = "google";
    user.googleId = googleId;
    user.avatar = picture;
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;

    await user.save({ validateBeforeSave: false });
  }

  const refreshToken = generateRefreshToken({ id: user._id });
  const accessToken = generateAccessToken({ id: user._id });

  user.refreshToken = hashToken(refreshToken);

  await user.save({ validateBeforeSave: false });
  await ensureFreeSubscription(user._id);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};
export {
  register,
  login,
  googleLogin,
  refresh,
  logout,
  forgetPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getMe,
};
