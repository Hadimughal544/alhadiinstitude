import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertCloudinaryConfigured, cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_DOC_BYTES = 15 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const DOC_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function docTypeFromFile(file: File): "pdf" | "doc" | "docx" | null {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    return "docx";
  }
  if (file.type === "application/msword" || name.endsWith(".doc")) return "doc";
  return null;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertCloudinaryConfigured();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cloudinary not configured" },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const isImage = IMAGE_TYPES.has(file.type);
  const attachmentType = docTypeFromFile(file);
  const isDoc = Boolean(attachmentType) || DOC_TYPES.has(file.type);

  if (!isImage && !isDoc) {
    return NextResponse.json(
      { error: "Only images (JPEG, PNG, WebP, GIF) or PDF/Word files are allowed." },
      { status: 400 }
    );
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_DOC_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json(
      {
        error: isImage
          ? "Image must be 8MB or smaller."
          : "Document must be 15MB or smaller.",
      },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;

  try {
    if (isImage) {
      const result = await cloudinary.uploader.upload(base64, {
        folder: "alhadi/blogs",
        resource_type: "image",
      });

      return NextResponse.json({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: "image",
        width: result.width,
        height: result.height,
        originalFilename: file.name,
      });
    }

    const result = await cloudinary.uploader.upload(base64, {
      folder: "alhadi/blogs/docs",
      resource_type: "raw",
      use_filename: true,
      unique_filename: true,
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: "raw",
      attachmentType: attachmentType || "pdf",
      originalFilename: file.name,
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
