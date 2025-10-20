import "express"; // ensures the module is loaded
import "http";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

declare module "http" {
  interface IncomingMessage {
    userId?: string;
  }
}

export {}; // keep this a module
