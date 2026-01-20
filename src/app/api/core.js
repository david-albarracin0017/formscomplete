import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 5 } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Archivo subido:", file.url);
      return { url: file.url };
    }),
};

// AÑADE ESTA LÍNEA para que las utilidades funcionen
/** @typedef {typeof ourFileRouter} OurFileRouter */