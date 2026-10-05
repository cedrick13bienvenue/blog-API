import multer from "multer";
import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { readFile } from "fs";
import { join } from "path";
import { config } from "dotenv";

config();

// 🌩️ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// 🔄 Upload buffer directly to Cloudinary using a stream
export const uploadFile = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const buffer = file?.buffer;
    if (!buffer) return reject(new Error("No file buffer found"));

    const stream = cloudinary.uploader.upload_stream(
      {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          console.error("Cloudinary Upload Error:", error);
          return reject(new Error("Failed to upload image"));
        }
        resolve(result.secure_url);
      }
    );

    // Pipe buffer to Cloudinary stream
    Readable.from(buffer).pipe(stream);
  });
};

// 🧠 File Extension Helper (from MIME type)
const getExtension = (mimeType: string): string => {
  const types: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
  };
  return types[mimeType] || "jpg";
};

// 📥 Multer Setup (Memory Storage Only)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPEG and PNG images are allowed"));
  },
});

// 📂 Read File from Disk (only if you have local files)
interface RequestParams extends Request {
  params: {
    filename: string;
  };
}

export const ReadFileName = (req: RequestParams, res: Response) => {
  const { filename } = req.params;
  const filePath = join(__dirname, "../../uploads", filename);

  readFile(filePath, (error, result) => {
    if (error) {
      console.error("File read error:", error);
      return res.status(404).send("File not found");
    }
    res.send(result);
  });
};
