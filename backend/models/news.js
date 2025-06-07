const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types

const newsSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    Sports: {
        type: String,
        default: "General"
    },
    postedBy: {
        type: ObjectId,
        ref: "USER"
    }
}, { timestamps: true })

mongoose.model("NEWS", newsSchema)
