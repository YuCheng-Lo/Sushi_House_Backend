const saltRounds = Number(process.env.SALT_ROUNDS);

if (!process.env.SALT_ROUNDS) {
  throw new Error("SALT_ROUNDS 未設定");
}

if (Number.isNaN(saltRounds)) {
  throw new Error("SALT_ROUNDS 必須是數字");
}

export const env = {
  saltRounds,
};
