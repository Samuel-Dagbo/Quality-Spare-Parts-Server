const sharp = require("sharp");
const ApiError = require("../utils/ApiError");
const Image = require("../middleware/models/Image");

const uploadImage = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return next(new ApiError(400, "No file uploaded"));
    }

    const transformer = sharp(file.buffer).rotate().resize({
      width: 1200,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true
    });

    const { data, info } = await transformer
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });

    const imageDoc = await Image.create({
      filename: file.originalname,
      contentType: "image/jpeg",
      data,
      size: info.size,
      width: info.width,
      height: info.height,
      createdBy: req.user?._id
    });

    const url = `/api/uploads/${imageDoc._id}`;
    return res.status(201).json({ data: { id: imageDoc._id, url } });
  } catch (error) {
    return next(error);
  }
};

const getImage = async (req, res, next) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return next(new ApiError(404, "Image not found"));
    }

    res.set("Content-Type", image.contentType);
    res.set("Content-Length", image.size.toString());
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    return res.send(image.data);
  } catch (error) {
    return next(error);
  }
};

module.exports = { uploadImage, getImage };
