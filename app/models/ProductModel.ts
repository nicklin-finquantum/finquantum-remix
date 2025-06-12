import mongoose, { type InferSchemaType, type Types } from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    ref: 'Product',
    required: true,
  },
});

export type Product = InferSchemaType<typeof ProductSchema> & {
  _id: Types.ObjectId;
  id?: Types.ObjectId;
};
const ProductModel = mongoose.model('Product', ProductSchema);

export default ProductModel;
