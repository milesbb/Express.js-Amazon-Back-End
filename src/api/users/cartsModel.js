
import mongoose from "mongoose"

const { Schema, model } = mongoose

const cartsSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
      },
    ],
    status: { type: String, required: true, enum: ["Active", "Paid"] },
  },
  { timestamps: true }
)

export default model("Cart", cartsSchema)