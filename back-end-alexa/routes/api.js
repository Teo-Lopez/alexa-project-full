const express = require('express')
const router = express.Router()

const Player = require('../models/Player')


router.post('/player/modify/:name', (req, res) => {
  console.log(req.params.name)
  console.log(req.body)
  const player = {...req.body}
  Player.findOneAndUpdate({nombre: req.params.name}, player, {new: true})
  .then(player => res.json(player))
  .catch(err => console.log(err))
})

router.post('/player/new', (req, res) => {
  const player = {...req.body}
  Player.create([player])
  .then(player => res.json(player))
  .catch(err => console.log(err))
  
} )


router.get('/player/:name', (req, res, next) =>  {

    Player.findOne({nombre: req.params.name}) 
    .then(player => { res.json( player ) })           // ESTO ES LA VISTA
    .catch(error => console.log(error))
  

})



module.exports = router
