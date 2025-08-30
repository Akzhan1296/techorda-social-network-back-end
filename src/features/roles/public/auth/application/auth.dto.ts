export type EmailDataDTO = {
  email: string;
  code: string;
  letterTitle: string;
  letterText: string;
  codeText?: string;
};

//registration types
export type RegistrationUserResultDTO = {
  isLoginAlreadyExist: boolean;
  isEmailAlreadyExist: boolean;
  isUserRegistered: boolean;
  isUserCreated: boolean;
};
export type RegistrationUserDTO = {
  login: string;
  password: string;
  email: string;
};

// registration confirmation types
export type RegistrationConfirmationResultDTO = {
  isUserByConfirmCodeFound: boolean;
  isEmailAlreadyConfirmed: boolean;
  isConfirmDateExpired: boolean;
  isRegistrationConfirmed: boolean;
};
export type RegistrationConfirmationDTO = {
  code: string;
};

// registration email resending
export type RegistrationEmailResendingResultDTO = {
  isUserFound: boolean;
  isEmailResent: boolean;
  isEmailAlreadyConfirmed: boolean;
  isConfirmDataUpdated: boolean;
};

// login
export type AuthDTO = {
  loginOrEmail: string;
  password: string;
  deviceName: string;
  deviceIp: string;
};

export type AutoResultDTO = {
  accessToken: null | string;
  refreshToken: null | string;
  isCorrectPassword: boolean;
  isUserAlreadyHasAuthSession: boolean;
};

// refresh token
export interface GetRefreshTokenDTO {
  userId: string;
  deviceId: string;
}

export type RefreshTokenResultDTO = {
  isUserFound: boolean;
  isUserAlreadyHasAuthSession: boolean;
  accessToken: null | string;
  refreshToken: null | string;
};

// tokens
export interface AccessTokenPayloadDTO {
  userId: string;
  login: string;
  email: string;
}
export interface RefreshTokenPayloadDTO extends AccessTokenPayloadDTO {
  deviceName: string;
  deviceIp: string;
  deviceId: string;
  createdAt: Date;
}

// logout
export interface LogOutDTO extends GetRefreshTokenDTO {}
export interface LogOutResultDTO {
  isDeleted: boolean;
  isForbidden: boolean;
}

// recovery
export type RecoveryPasswordResultDTO = {
  isUserFound: boolean;
  isConfirmDataUpdated: boolean;
};

export type NewPasswordDTO = {
  newPassword: string;
  recoveryCode: string;
};

export type NewPasswordResultDTO = {
  isRegistrationDataFound: boolean;
  isCorrectRecoveryCode: boolean;
  isPasswordUpdated: boolean;
};
