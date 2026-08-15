//VALIDATIONS
export type ValidResetPassword = { body: { password: string }; query: { token: string } };
export type ValidLogout = { body: { refreshToken: string; accessToken: string } };
export type ValidGetResetPasswordToken = { body: { email: string; redirect: string } };
export type ValidUpdateSessionRole = { body: { data: { userRoleId: string } } };
export type ValidLogin = { body: { email: string; password: string } };
export type ValidRefreshToken = { body: { refreshToken: string } };
