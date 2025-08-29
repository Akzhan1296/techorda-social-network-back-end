import bcrypt from "bcrypt";

export const generateHash = async (password: string) => {
  const hash = await bcrypt.hash(password, 10);
  return hash;
};
