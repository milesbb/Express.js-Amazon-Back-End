import express from "express";
import ProductModel from "./model.js";
import q2m from "query-to-mongo";
import createHttpError from "http-errors";

const productsRouter = express.Router();

// PRODUCTS

// GET

productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await ProductModel.find().populate({
      path: "reviews",
      select: "comment rate",
    });
    res.send(products);
  } catch (error) {
    next(error);
  }
});

// GET PRODUCTS PAGINATION

productsRouter.get("/paginate", async (req, res, next) => {
  try {
    const mQuery = q2m(req.query);

    const totalProducts = await ProductModel.countDocuments(mQuery.criteria);

    const products = await ProductModel.find(
      mQuery.criteria,
      mQuery.options.fields
    )
      .skip(mQuery.options.skip)
      .limit(mQuery.options.limit)
      .sort(mQuery.options.sort)
      .populate({ path: "reviews", select: "comment rate" });

    res.send({
      links: mQuery.links("http://localhost:3001/products", totalProducts),
      totalProducts,
      totalPages: Math.ceil(totalProducts / mQuery.options.limit),
      products,
    });
  } catch (error) {
    next(error);
  }
});

// GET SPECIFIC

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId).populate({
      path: "reviews",
      select: "comment rate",
    });
    if (product) {
      res.send(product);
    } else {
      next(
        createHttpError(
          404,
          `Product with ID ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// POST

productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductModel(req.body);
    const { _id } = await newProduct.save();

    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

// PUT

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedProduct) {
      res.send(updatedProduct);
    } else {
      next(
        createHttpError(
          404,
          `Product with ID ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// DELETE

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(
      req.params.productId
    );

    // ADD DELETING OF REVIEWS WHEN PRODUCT IS DELETED

    if (deletedProduct) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Product with ID ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// REVIEWS

// GET

productsRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId);

    if (product) {
      res.send(product.reviews);
    } else {
      next(
        createHttpError(
          404,
          `Product with ID ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// GET SPECIFIC

productsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId).populate({
      path: "reviews",
      select: "comment rate",
    });
    if (product) {
      const selectedReview = product.reviews.find(
        (review) => review._id.toString() === req.params.reviewId
      );

      if (selectedReview) {
        res.send(selectedReview);
      } else {
        next(
          createHttpError(
            404,
            `review with ID ${req.params.reviewId} not found`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `product with ID ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// POST

productsRouter.post("/:productId/reviews", async (req, res, next) => {
  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      req.params.productId,
      { $push: { reviews: req.body } },
      { new: true, runValidators: true }
    );

    if (updatedProduct) {
      res.status(201).send(updatedProduct);
    } else {
      next(
        createHttpError(
          404,
          `product with ID ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// PUT

productsRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId);

    if (product) {
      const selectedReviewIndex = product.reviews.findIndex(
        (review) => review._id.toString() === req.params.reviewId
      );

      if (selectedReviewIndex !== -1) {
        product.reviews[selectedReviewIndex] = {
          ...product.reviews[selectedReviewIndex],
          ...req.body,
        };

        await product.save();

        res.send(product);
      } else {
        next(
          createHttpError(
            404,
            `review with ID ${req.params.reviewId} not found`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `product with ID ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// DELETE

productsRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        req.params.productId,
        { $pull: { reviews: { _id: req.params.reviewId } } },
        { new: true }
      );

      if (updatedProduct) {
        res.send(updatedProduct);
      } else {
        next(
          createHttpError(
            404,
            `product with ID ${req.params.productId} not found`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default productsRouter;
