const StateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  districts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("State", StateSchema);
