/**
 * File: src/middlewares/sanitizeHtml.js
 * Mục đích: Sanitize HTML content để ngăn XSS attacks
 */

import sanitizeHtml from "sanitize-html";

/**
 * Middleware để sanitize HTML content trong request body
 * Được áp dụng cho các routes tạo/cập nhật bài viết
 */
export const sanitizePostContent = (req, res, next) => {
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
      allowProtocols: ["http", "https", "data", "ftp"],
      transformTags: {
        img: function (tagName, attribs) {
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
      parseStyleString: false,
    });
  }

  next();
};
