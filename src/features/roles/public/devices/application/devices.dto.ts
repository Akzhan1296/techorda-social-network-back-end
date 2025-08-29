export type DeleteDeviceDTO = {
  userId: string;
  deviceId: string;
};

export type DeleteDeviceResultDTO = {
  isUserFound: boolean;
  isDeviceFound: boolean;
  canDeleteDevice: boolean;
  isDeviceDeleted: boolean;
};
