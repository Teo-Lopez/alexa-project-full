function randomCharacteristic() {
  return Math.floor(Math.random()*30)
}

class Player{
  constructor() {
      this.nombre= "",
      this.stage= 0,
      this.ubication= "cubiculo"
      this.lastIntent ="introIntent"
      this.inventory= {phone: false, card: false, gun: false}
      this.chosings= []
      this.character= {
          nombre: ""
      }
  }
}

/*
const TheDoctor = {             //Not a class, cause there's only one
    inventory: [screwdriver, tardis],
    companions: {
        
    }
}
  */
module.exports = Player