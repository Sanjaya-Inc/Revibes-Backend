export type TCreateUser = {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  password?: string;
}

export type TGetUserByEmail = {
  email: string;
}