const mongoose = require("mongoose");
module.exports = mongoose.model("User", mongoose.Schema({
    id: String,
    displayName: String,
    accessToken: String
}));