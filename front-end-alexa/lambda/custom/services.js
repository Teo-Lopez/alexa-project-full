const axios = require("axios")


class Services{
    constructor() {}
    
    getPlayer(playerName) {
        return axios.get(`https://new-adventure.herokuapp.com/api/player/${playerName}`)
          .then( response => response.data)
          .catch()
    }

    updatePlayer(player) {
        axios.post(`https://new-adventure.herokuapp.com/api/player/modify/${playerName}`, player)
          .then(response => response.data)
          .catch(err => console.log(err))
    }

    createPlayer(player) {
      axios.post(`https://new-adventure.herokuapp.com/api/player/new`, player)
        .then(player => player)
        .catch(err => console.log(err))
    }
}

module.exports = Services