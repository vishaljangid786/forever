import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  uid: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  createdby: {
    type: String,
    required: true,
  },
  // title: { type: String, required: false },
});

// module.exports = mongoose.model('Bill', billSchema)
export default mongoose.model("Bill", billSchema);
