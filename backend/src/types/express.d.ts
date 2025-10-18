import "express"; // ensures the module is loaded

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export {}; // keep this a module
