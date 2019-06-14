const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playerSchema = new Schema({
    nombre: {type: String, unique: true},
    stage: Number,
    lastIntent: String,
    ubication: String,
    inventario: [],
    character: {
      nombre: String
    }
}, {
    timestamps: true
  });

const Player = mongoose.model("Player", playerSchema);

module.exports = Player;