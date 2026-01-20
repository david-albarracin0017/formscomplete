import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

// Importamos el objeto
import { ourFileRouter } from "../api/core";

// Usamos 'typeof ourFileRouter' para pasar el genérico correctamente
export const UploadButton = generateUploadButton<typeof ourFileRouter>();
export const UploadDropzone = generateUploadDropzone<typeof ourFileRouter>();

