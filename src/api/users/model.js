import mongoose from "mongoose";

const { Schema, model } = mongoose;

const usersSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    age: { type: Number, required: true, min: 18, max: 65 },
    address: { type: String, required: true },
    carts: [{ type: Schema.Types.ObjectId, ref: "Cart" }],
  },
  {
    timestamps: true,
  }
);

export default model("User", usersSchema);
