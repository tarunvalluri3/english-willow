import slugify from "slugify";

const generateSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

export default generateSlug;