import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import ImageKit, { toFile } from "@imagekit/nodejs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");
const uploadProvider = (process.env.IMAGE_UPLOAD_PROVIDER || "auto").toLowerCase();

const hasImageKitConfig = Boolean(
  process.env.IMAGEKIT_PRIVATE_KEY &&
  process.env.IMAGEKIT_PUBLIC_KEY &&
  process.env.IMAGEKIT_URL_ENDPOINT
);

const shouldUseImageKit = uploadProvider !== "local" && hasImageKitConfig;

const imagekit = shouldUseImageKit
  ? new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      // Add timeout configuration to prevent hanging requests
      transformation: {
        preTransforms: [],
      },
      // Set reasonable timeout for uploads (30 seconds)
      uploadTimeout: 30000,
    })
  : null;

const sanitizeFileName = (fileName = "upload") => {
  const ext = path.extname(fileName) || ".png";
  const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9-_]/g, "-");
  return `${Date.now()}-${baseName || "image"}${ext}`;
};

export const uploadImageFile = async (file, folder = "/users") => {
  if (!file?.buffer) {
    throw new Error("Image file buffer is required");
  }

  if (imagekit) {
    try {
      const response = await imagekit.files.upload({
        file: await toFile(file.buffer, file.originalname),
        fileName: file.originalname,
        folder,
      });

      return { url: response.url, storage: "imagekit" };
    } catch (error) {
      if (uploadProvider === "imagekit") {
        throw new Error(`ImageKit upload failed: ${error.message}`);
      }

      console.error("ImageKit upload failed, falling back to local storage:", error.message);
    }
  }

  await fs.mkdir(uploadsDir, { recursive: true });
  const fileName = sanitizeFileName(file.originalname);
  const filePath = path.join(uploadsDir, fileName);

  await fs.writeFile(filePath, file.buffer);

  return { url: `/uploads/${fileName}`, storage: "local" };
};

export const buildImageUrl = (req, imagePath, transformation = "") => {
  if (!imagePath) return "";

  const isAbsoluteUrl = /^https?:\/\//i.test(imagePath);
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const resolvedUrl = isAbsoluteUrl ? imagePath : `${baseUrl}${imagePath}`;

  if (transformation && isAbsoluteUrl && imagekit) {
    const separator = resolvedUrl.includes("?") ? "&" : "?";
    return `${resolvedUrl}${separator}tr=${transformation}`;
  }

  return resolvedUrl;
};

export default imagekit;
