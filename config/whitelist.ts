
// 您可以在這裡手動添加允許使用的 Google Email 帳號
export const ALLOWED_USERS = [
  "test@example.com",
  "admin@viralgatekeeper.com",
  "tp6m4tp6@gmail.com",
  "1@google.com" // 您可以將自己的 email 加在這裡測試
];

export const isUserAllowed = (email: string): boolean => {
  return ALLOWED_USERS.includes(email);
};
