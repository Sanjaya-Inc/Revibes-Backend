// import AppError from "../utils/formatter/AppError";

// export const multipartFormParser = async (name: string) => {
//   return async function(
//     req: Request,
//     res: Response,
//     next: () => void,
//   ) {
//     name
//     const contentType = req.headers.get("content-type");
//     if (!contentType || !contentType.startsWith("multipart/form-data")) {
//       throw new AppError(400, "COMMON.BAD_REQUEST");
//     }

//     const boundary = contentType.split("boundary=")[1];
//     if (!boundary) throw new AppError(400, "COMMON.BAD_REQUEST");

//     const body = req.body
//       ? Buffer.from(await req.body.getReader().read().then(({ value }) => value || new Uint8Array()))
//       : Buffer.alloc(0);
//     const boundaryBuffer = Buffer.from("--" + boundary);

//     const parts = body
//       .toString("binary")
//       .split(boundaryBuffer.toString("binary"))
//       .filter((part) => part.trim() && part.trim() !== "--");

//     const data = parts.map((part) => {
//       const [rawHeaders, rawContent] = part.split("\r\n\r\n");

//       const headers = rawHeaders.split("\r\n").reduce((acc, line) => {
//         const [key, ...rest] = line.split(":");
//         acc[key.toLowerCase()] = rest.join(":").trim();
//         return acc;
//       }, {} as Record<string, string>);

//       if (!headers["content-disposition"]) continue;

//       const disposition = headers["content-disposition"];
//       const nameMatch = disposition.match(/name="(.+?)"/);
//       const filenameMatch = disposition.match(/filename="(.+?)"/);
//       const name = nameMatch?.[1];
//       const filename = filenameMatch?.[1];

//       const mimetype = headers["content-type"] || "application/octet-stream";

//       const contentBuffer = Buffer.from(rawContent.trim(), "binary");

//       if (filename) {
//         return {
//           fieldname: name,
//           originalname: filename,
//           encoding: "7bit", // assume or parse from headers
//           mimetype,
//           size: contentBuffer.length,
//           buffer: contentBuffer,
//         };
//       }
//     });

//     // req[name] = data;

//     next();
//   }
// };
