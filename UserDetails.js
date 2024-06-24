const mongoose = require('mongoose');

const UserDetailSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  CPF: {type: String, required: true},
  telephone: { type: String, required: true },
  password: { type: String, required: true },
});

const UserInfo = mongoose.model("UserInfo", UserDetailSchema);

module.exports = UserInfo;