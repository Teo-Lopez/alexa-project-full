const mongoose = require('mongoose');
const Player = require('../models/Player')

const players = [
  {
      nombre: "popino",
      stage: 0,
      character: {
          nombre: "Popino-cop",
          clase: "guerrero",
          nivel: 100,
          fuerza: 2000,
          inteligencia: 2000,
          destreza: 2000,
          constitucion: 2000,
          carisma: 2000
      }
  }
]


mongoose.connect(`${process.env.DB}`);


Player.collection.drop()
  .then(

    Player.create(players)
      .then(playersCreated => {
        console.log(`Creados ${playersCreated.length} personajes`)
        mongoose.connection.close()
      })
      .catch(err => {console.log(`Hubo un error: ${err}` ); mongoose.connection.close()})

  )
  .catch(error => {console.log(`Hubo un error: ${err}` ); mongoose.connection.close()})
