function randomCharacteristic() {
  return Math.floor(Math.random()*30)
}

class Player{
  constructor() {
      this.nombre= "",
      this.stage= 0,
      this.location= "cubiculo"
      this.character= {
          nombre: ""
      }
      this.inventario= {}
  }
}
  
module.exports = Player