import { Request } from "express";

export function parseFormData<T>(req: Request): T {
  const fields: Record<string, any> = {};

  // Process files first, as they are typically the most unique part
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach((file: any) => {
      // Use 'any' here if types are still fighting you for 'size'
      const formattedFile = {
        buffer: file.buffer,
        filename: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size || (file.buffer ? file.buffer.length : 0), // Prefer file.size if available
      };
      fields[file.fieldname] = formattedFile;
    });
  }

  // Then merge regular body fields.
  // express-multipart-file-parser should have already populated req.body with non-file fields.
  // Object.assign will correctly merge properties, respecting existing file fields if their names overlap,
  if (req.body && typeof req.body === "object") {
    // Get all enumerable own properties of req.body
    Object.keys(req.body).forEach((key) => {
      // Exclude specific unwanted keys and numeric buffer indices
      if (key !== "parent" && key !== "offset" && isNaN(parseInt(key, 10))) {
        fields[key] = req.body[key];
      }
    });
  }

  return fields as T;
}
