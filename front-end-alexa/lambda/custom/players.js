function randomCharacteristic() {
  return Math.floor(Math.random()*30)
}

class Player{
  constructor() {
      this.nombre= "",
      this.stage= 0,
      this.character= {
          nombre: "",
          clase: "",
          nivel: 1,
          fuerza: randomCharacteristic(),
          inteligencia: randomCharacteristic(),
          destreza: randomCharacteristic(),
          constitucion: randomCharacteristic(),
          carisma: randomCharacteristic(),
      }
  }
}
  
module.exports = Player