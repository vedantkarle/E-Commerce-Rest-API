import Product from "../models/Product";
import multer from "multer";
import path from "path";
import CustomErrorHandler from "../services/CustomErrorHandler";
import fs from "fs";
import Joi from "joi";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, name);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 }, //5MB,
}).single("image");

export const createProduct = async (req, res, next) => {
  handleMultipartData(req, res, async (err) => {
    if (err) return next(CustomErrorHandler.serverError(err.message));

    const filePath = req.file.path;

    //validation

    const productSchema = Joi.object({
      name: Joi.string().required(),
      price: Joi.number().required(),
    });

    const { error } = productSchema.validate(req.body);

    if (error) {
      //Delete uploaded image

      fs.unlink(`${root}/${filePath}`, (err) => {
        if (err) {
          return next(CustomErrorHandler.serverError(err));
        }
      });

      return next(error);
    }

    const { name, price } = req.body;

    let doc;

    try {
      doc = await Product.create({ name, price, image: filePath });
    } catch (error) {
      return next(error);
    }

    res.json(doc);
  });
};
