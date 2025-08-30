export type CreateUserEntryDTO = {
  login: string;
  passwordHash: string;
  email: string;
  createdAt: Date;
};

export type RegistrationEntryDTO = {
  userId: { Id: string };
  confirmCode: string;
  isConfirmed: boolean;
  emailExpDate: Date;
  createdAt: Date;
};

export type ConfirmRegistrationEntryDTO = {
  confirmCode: string;
  isConfirmed: boolean;
};

export type NewConfirmCodeEntryDTO = {
  emailExpDate: Date;
  confirmCode: string;
  registrationId: string;
};

// view models

export type RegistrationViewDTO = {
  createdAt: Date;
  emailExpDate: Date;
  isConfirmed: boolean;
  confirmCode: string;
  registrationId: string;
  userId: string;
};

export type UserViewDTO = {
  id: string;
  login: string;
  password: string;
  email: string;
};

export type UserQueryViewDTO = Pick<UserViewDTO, "login" | "email"> & {
  userId: string;
};

export type RegistrationWithUserViewDTO = {
  registrationId: string;
  confirmCode: string;
  isConfirmed: boolean;
  emailExpDate: Date;
  createdAt: Date;
  userId: string;
  email: string;
};

export type CreatedUserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
};

export type NewPasswordDTO = {
  userId: string;
  passwordHash: string;
};
