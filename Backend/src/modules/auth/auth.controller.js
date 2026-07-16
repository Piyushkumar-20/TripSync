import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
};

const register = async (req, res) => {
  const user = await authService.register(req.body);
  ApiResponse.created(res, "Verification email sent. Please check your inbox.", user);
};

const login = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie("refreshToken", refreshToken, cookieOptions);
  ApiResponse.ok(res, "Login Successfull!", { user, accessToken });
};

const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(token);

  res.cookie("refreshToken", newRefreshToken, cookieOptions);

  ApiResponse.ok(res, "Refreshed Token", { accessToken });
};

const logout = async (req, res) => {
  await authService.logout(req.user.id);
  res.clearCookie("refreshToken", clearCookieOptions);
  ApiResponse.ok(res, "Logged Out!");
};

const forgetPassword = async (req, res) => {
  await authService.forgetPassword(req.body.email);
  ApiResponse.ok(res, "Reset Password email has been sent");
};

const resetPassword = async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password);
  ApiResponse.ok(res, "Password Reset Successfully");
};

const verifyEmail = async (req, res) => {
  const user = await authService.verifyEmail(req.params.token);
  ApiResponse.ok(res, "Email verified successfully", user);
};

const resendVerificationEmail = async (req, res) => {
  await authService.resendVerificationEmail(req.body.email);
  ApiResponse.ok(res, "Verification email has been sent");
};

const getMe = async (req, res) => {
  const user = await authService.getMe(req.user.id);
  ApiResponse.ok(res, "User profile", user);
};

const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  const { user, accessToken, refreshToken } =
    await authService.googleLogin({ idToken });

  res.cookie("refreshToken", refreshToken, cookieOptions);

  ApiResponse.ok(res, "Google login successful!", {
    user,
    accessToken,
  });
};
export {
  register,
  login,
  googleLogin,
  refreshToken,
  logout,
  forgetPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getMe,
};
