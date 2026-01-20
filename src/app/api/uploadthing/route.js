// src/app/api/uploadthing/route.js
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "../core"; // Importa tu manual

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});