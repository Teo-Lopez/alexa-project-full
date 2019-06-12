const express = require('express')
const router = express.Router()

const Player = require('../models/Player')


router.post('/player/modify/:name', (req, res) => {
  Player.findOneAndUpdate({nombre: req.params.name}, {player: req.body}, {new: true})
  .then(player => console.log(player))
  .catch(err => console.log(err))
})

router.post('/player/new', (req, res) => {
  Player.create([req.body])
  .then(player => res.json(player))
  .catch(err => console.log(err))
  
} )


router.get('/player/:name', (req, res, next) =>  {
    console.log("entra", req.params.name)



    Player.findOne({nombre: req.params.name}) 
    .then(player => {
      console.log(player)
      res.json( player )
    })           // ESTO ES LA VISTA
    .catch(error => console.log(error))
  

})



module.exports = router
