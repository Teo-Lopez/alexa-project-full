const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playerSchema = new Schema({
    nombre: {type: String, unique: true},
    stage: String,
    character: {
      nombre: String,
      clase: String,
      nivel: Number,
      fuerza: Number,
      inteligencia: Number,
      destreza: Number,
      constitucion: Number,
      carisma: Number
    },
}, {
    timestamps: true
  });

const Player = mongoose.model("Player", playerSchema);

module.exports = Player;