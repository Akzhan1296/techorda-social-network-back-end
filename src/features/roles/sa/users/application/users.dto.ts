export type CreateUserDTO = {
  login: string;
  password: string;
  email: string;
};

export type DeleteUserResultDTO = {
  isUserFound: boolean;
  isUserDeleted: boolean;
  isUserHaveRegistrationData: boolean;
  IsRegistrationDataDeleted: boolean;
};
