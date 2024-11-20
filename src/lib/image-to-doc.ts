import { PDFDocument, PDFImage } from "pdf-lib";

const MARGIN = 15;

export const imageToDoc = async (
  imageData: string,
  mime: string,
  doc: PDFDocument
) => {
  const page = doc.addPage();
  const { width, height } = page.getSize();
  let image: PDFImage | null = null;
  if (mime === "image/jpeg") {
    image = await doc.embedJpg(imageData);
  } else if (mime === "image/png") {
    image = await doc.embedPng(imageData);
  }

  if (!image) {
    throw new Error("Invalid image type");
  }

  let scalingFactor = 1;

  const imageAspectRatio = image.width / image.height;
  const pageAspectRatio = (width - MARGIN) / (height - MARGIN);

  if (imageAspectRatio > pageAspectRatio) {
    scalingFactor = (width - MARGIN) / image.width;
  } else {
    scalingFactor = (height - MARGIN) / image.height;
  }

  const imageDims = image.scale(scalingFactor);

  page.drawImage(image, {
    x: width / 2 - imageDims.width / 2,
    y: height / 2 - imageDims.height / 2,
    width: imageDims.width,
    height: imageDims.height,
  });
};
