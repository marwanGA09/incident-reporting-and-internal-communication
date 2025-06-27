export {};

// Create a type for the roles
export type Roles = "admin" | "regular";
export type Position = "higher" | "middle" | "lower";
// position?: "higher" | "middle" | "lower";
// departmentId?: string;
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
      position?: Position;
      departmentId?: string;
    };
  }
}
