/**
 * File: middlewares/sanitizeHtml.ts
 * Mục đích: Sanitize HTML content để ngăn XSS attacks
 */

import { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";

interface PostContentRequest extends Request {
  body: {
    content?: string;
  };
}

/**
 * Middleware để sanitize HTML content trong request body
 * Được áp dụng cho các routes tạo/cập nhật bài viết
 */
export const sanitizePostContent = (
  req: PostContentRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body.content && typeof req.body.content === "string") {
    req.body.content = sanitizeHtml(req.body.content, {
      allowedTags: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "br",
        "strong",
        "em",
        "u",
        "strike",
        "a",
        "img",
        "ul",
        "ol",
        "li",
        "blockquote",
        "pre",
        "code",
      ],
      allowedAttributes: {
        a: ["href", "title", "target"],
        img: ["src", "alt", "width", "height", "title"],
        code: ["class"],
      },
      allowedSchemes: ["http", "https", "data", "ftp"],
      transformTags: {
        img: function (_tagName: string, attribs: Record<string, string>) {
          return {
            tagName: "img",
            attribs: {
              src: attribs.src,
              alt: attribs.alt || "Image",
              title: attribs.title || "",
            },
          };
        },
      },
      disallowedTagsMode: "discard",
    });
  }

  next();
};
