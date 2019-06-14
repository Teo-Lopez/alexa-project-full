const axios = require("axios")


class Services{
    constructor() {}
    
    getPlayer(playerName) {
        return axios.get(`https://new-adventure.herokuapp.com/api/player/${playerName}`)
          .then( response => response.data)
          .catch()
    }
    
    updatePlayer(player) {
        axios.post(`https://new-adventure.herokuapp.com/api/player/modify/${player.nombre}`, player)
          .then(response => response.data)
          .catch(err => console.log(err))
    }
    
    
    createPlayer(player) {
      axios.post(`https://new-adventure.herokuapp.com/api/player/new`, player)
        .then(response => response.data)
        .catch(err => console.log(err))
    }
}

module.exports = Services