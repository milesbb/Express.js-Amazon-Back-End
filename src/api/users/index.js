import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";

import CartsModel from "./cartsModel.js";

const usersRouter = express.Router();

// USERS

// POST USER

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

// GET USERS

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find().populate({ path: "carts", select: "products status"});
    res.send(users);
  } catch (error) {
    next(error);
  }
});

// GET SPECIFIC USER

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

// EDIT USER

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

// DELETE USER

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.params.userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// CART

// GET ALL USER'S CARTS

usersRouter.get("/:userId/carts", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId).populate({path: "carts", select: "products status"})
    res.status(200).send(user.carts);
  } catch (error) {
    next(error);
  }
});

// GET USER'S SPECIFIC CART

usersRouter.get("/carts/:cartId", async (req, res, next) => {
  try {
    const cart = await CartsModel.findById(req.params.cartId).populate({path: "owner", select: "firstName lastName age"});

    res.status(200).send(cart);
  } catch (error) {
    next(error);
  }
});

// CREATE CART

usersRouter.post("/:userId/carts", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);

    if (user) {
        const newCartData = {
            ...req.body,
            owner: req.params.userId,
            status: "Active"
        }

      const newCart = new CartsModel(newCartData);

      const { _id } = await newCart.save();

      await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { $push: { carts: newCart._id } },
        { new: true, runValidators: true }
      );
      res.status(201).send({ _id });
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// EDIT CART

usersRouter.put("/carts/:cartId", async (req, res, next) => {
  try {
    const updatedCart = await CartsModel.findByIdAndUpdate(
      req.params.cartId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedCart) {
      res.send(updatedCart);
    } else {
      next(createHttpError(404, `Cart with id ${req.params.cartId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

// DELETE CART

usersRouter.delete("/carts/:cartId", async (req, res, next) => {
    try {
      const deletedCart = await CartsModel.findByIdAndDelete(req.params.cartId);
      if (deletedCart) {
        res.status(204).send();
      } else {
        next(
          createHttpError(404, `Cart with id ${req.params.cartId} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  });

export default usersRouter;
