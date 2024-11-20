import { z } from "zod";
import { PDFDocument } from "pdf-lib";
import { imageToDoc } from "../../lib/image-to-doc";
import { db } from "../../lib/db";
import { uploadFile } from "../../lib/s3/uploadFile";
import { officeToDoc } from "../../lib/office-to-doc";
import { asyncHandler } from "../../lib/async-handler";

const bodySchema = z.object({
  files: z.array(
    z.object({
      mime: z.string(),
      data: z.string(),
    })
  ),
  all: z.boolean(),
  copies: z.number(),
  bothSides: z.boolean(),
  pageConfig: z.object({
    bw: z.array(z.number()),
    color: z.array(z.number()),
  }),
});

const COSTS = {
  bw: 1,
  color: 5,
};

export const newOrderHandler = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new Error("User not logged in");
  }

  const { bothSides, copies, files, pageConfig } = bodySchema.parse(req.body);

  const doc = await PDFDocument.create();

  for (const file of files) {
    if (file.mime === "application/pdf") {
      const data = Buffer.from(file.data, "base64");
      const pdf = await PDFDocument.load(data);
      const pages = await doc.copyPages(pdf, pdf.getPageIndices());
      for (const page of pages) {
        doc.addPage(page);
      }
    } else if (
      file.mime === "application/msword" ||
      file.mime ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mime === "application/vnd.ms-powerpoint" ||
      file.mime ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      const data = await officeToDoc(
        Buffer.from(file.data, "base64"),
        file.mime
      );
      const pdf = await PDFDocument.load(data);
      const pages = await doc.copyPages(pdf, pdf.getPageIndices());
      for (const page of pages) {
        doc.addPage(page);
      }
    } else if (file.mime.startsWith("image/")) {
      await imageToDoc(file.data, file.mime, doc);
    }
  }

  const bw = pageConfig.bw.length === 0 ? null : await PDFDocument.create();
  const color =
    pageConfig.color.length === 0 ? null : await PDFDocument.create();

  if (bw) {
    const pages = await bw.copyPages(doc, pageConfig.bw);
    for (const page of pages) {
      bw.addPage(page);
    }
  }
  if (color) {
    const pages = await color.copyPages(doc, pageConfig.color);
    for (const page of pages) {
      color.addPage(page);
    }
  }

  if (copies > 1) {
    if (bw) {
      for (let i = 1; i < copies; i++) {
        const pages = await bw.copyPages(bw, bw.getPageIndices());
        for (const page of pages) {
          bw.addPage(page);
        }
      }
    }
    if (color) {
      for (let i = 1; i < copies; i++) {
        const pages = await color.copyPages(color, color.getPageIndices());
        for (const page of pages) {
          color.addPage(page);
        }
      }
    }
  }

  const bwPageCount = bw ? bw.getPageCount() : 0;
  const bwCost = COSTS.bw * bwPageCount;
  const colorPageCount = color ? color.getPageCount() : 0;
  const colorCost = COSTS.color * colorPageCount;

  const otp = Math.round(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  const createdOrder = await db.order.create({
    data: {
      bwPageCount,
      colorPageCount,
      bwCost: bwCost * 100,
      colorCost: colorCost * 100,
      isBothSided: bothSides,
      totalCost: (bwCost + colorCost) * 100,
      otp,
      userId: user.id,
    },
  });

  if (bw) await uploadFile(await bw.save(), `files/${createdOrder.id}-bw.pdf`);
  if (color)
    await uploadFile(await color.save(), `files/${createdOrder.id}-color.pdf`);

  res.send({
    error: false,
    data: {
      id: createdOrder.id,
    },
  });
});
