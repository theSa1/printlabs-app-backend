import { convert } from "libreoffice-convert";

export const officeToDoc = async (file: Buffer, mime: string) => {
  const pdfFile = await new Promise<Buffer>((resolve, reject) => {
    convert(file, "pdf", undefined, (err, done) => {
      if (err) {
        reject(err);
      } else {
        resolve(done);
      }
    });
  });

  return pdfFile;
};
