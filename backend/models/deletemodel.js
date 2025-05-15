import mongoose from "mongoose";

const deleteSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const DeleteModel = mongoose.model("DeleteRequest", deleteSchema);

export default DeleteModel;
