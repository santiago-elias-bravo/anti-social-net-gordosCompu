export const ADMIN_USER_ID = "000000000000000000000000";

export function esAdmin(user: { _id: string } | null) {
  return user?._id === ADMIN_USER_ID;
}
