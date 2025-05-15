import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      min: 1
    },
    size: {
      type: String,
      min: 1
    },
    color: {
      type: String,
      min: 1
    },
    price:{
      type: Number,
    }
  }]
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart; 