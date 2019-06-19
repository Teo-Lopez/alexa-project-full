// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.

/*

Se llega al primer stage cuando se consigue el acceso a la sala de camaras.
Se llega al segundo stage cuando se desactivan. 

Si se activa el intent de salir del banco se acaba la partida.


TO DO:

INTENTS

    FIRSTFLOOR
    SALIDA
    SOTANO
    CAMARA ACORAZADA
    

*/

const Alexa = require('ask-sdk-core');
const Player = require("./players")
const Services = require("./services")
const services = new Services()

// GAME STATE MANAGER

let player




// |
// v Workaround for different json structures when invoking a slot value or a slot synonim

const places = {
    toilet: ["aseo", 'servicios', 'toilet', 'baño', 'aseos', 'servicio'],
    cubicle: ['cubiculo', 'cubículo', 'oficina', 'mi cubiculo', 'mi cubículo', 'mi oficina'],
    securityRoom: ['sala de cámaras', 'sala de seguridad', 'sala de vigilancia', "cámaras"],
    firstFloor: ["siguiente planta", "escalera", "escaleras", "bajo las escaleras", "cojo las escaleras", "bajo al primer piso", "bajo a la primera planta", "escaleras", "1.ª planta", "primer piso", "planta baja", "1.ᵉʳ piso"],
    basement: ["bajo al sotano", "sotano"],
    exit: ["salgo del banco", "salir del banco", "salir", "salgo"],
    vault: ["cámara acorazada", "cámara"]
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Indica tu partida diciendo "partida de", seguido de tu nombre.';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt()
            .getResponse();
    }
};


// ---------------------------------------------------------INTENTS GENERALES ----------------------------------------------------------------

/*
const showStatusHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'showStatusIntent';
            },
    handle(handlerInput) {
        const speechText = `Tu personaje es un ${player.nombre} `
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt()
            .getResponse()
    }
};
*/

//----------------------------------------- INTRO

const introIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'introIntent';
    },
    handle(handlerInput) {
        const speechText = `Año 2132, vives en la ciudad de Nueva Nueva York, trabajas en el Grand Central Bank cómo técnico de soporte. La rutina es agradable y el trabajo no trae demasiadas sorpresas. Hasta que B; A; I;, la inteligencia artificial que se encuentra a cargo de la ciudad, conecta contigo a través de tú implante neuronal estandar. Escuchas lo que te propone, sorprendido piensas sobre si aceptar o no, parece una locura y no sabes si serás capaz de conseguirlo. Decides aceptar y BAI borra de tu memoria superficial todo rastro de la información confidencial que te ha transmitido...`
        return handlerInput.responseBuilder
            .speak(speechText)
            .addDelegateDirective(player.lastIntent)
            .reprompt()
            .getResponse();
    }
};


// --------------------------------------- LOOK AROUND


const lookAroundIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'lookAroundIntent';
    },
    handle(handlerInput) {
        let speechText = ''
        const session = handlerInput.requestEnvelope.session.attributes

        switch (player.ubication) {
            case "cubiculo":

                if (session.cubicle.phone) {
                    speechText = `<audio src='soundbank://soundlibrary/office/amzn_sfx_typing_medium_01'/>
                    <audio src="https://res.cloudinary.com/ambdev/video/upload/v1560437094/alexa-voices/cubiculoLocation.mp3_fvkysg.mp3"/>`
                } else {
                    speechText = `<audio src='soundbank://soundlibrary/office/amzn_sfx_typing_medium_01'/>
                            <audio src="https://res.cloudinary.com/ambdev/video/upload/v1560439487/alexa-voices/cubicleNoPhone_xxgafh.mp3"/>`
                }

                break
            case "toilet":
                if (player.stage === 0.2 && !player.inventory.card) {
                    speechText = `Narrador: Te encuentras en los baños. Sobre el lavabo están la tarjeta del guarda y su teléfono. Oyes al guarda de seguridad dentro del aseo, no tardará mucho en salir.`
                } else if (player.stage === 0.2 && player.inventory.card) {
                    speechText = `Narrador: Te encuentras en los baños. Sobre el lavabo está su teléfono. Oyes al guarda de seguridad dentro del aseo, no tardará mucho en salir.`
                } else if (player.stage >= 0.4) {
                    speechText = `Estás en los aseos. Desde aquí puedes volver a tu cubiculo.`
                }
                break
            case "securityRoom":
                if (session.securityRoom.cameras) {
                    speechText = 'Narrador: Estás en la sala de seguridad. Las pantallas muestran videos en blanco y negro de la actividad en las oficinas. No parece que haya mucha gente hoy. Las cámaras están grabando.'
                } else {
                    speechText = 'Narrador: Estás en la sala de seguridad. Las cámaras han dejado de grabar, aun así se muestran videos en blanco y negro de la actividad en las oficinas. No parece que haya mucha gente hoy.'
                }
                break
            case "firstFloor":
                if (!session.securityRoom.cameras) {
                    speechText = 'Narrador: Estás en la primera planta. Ahora está desierta. '
                } else {
                    speechText = 'Narrador: Estás en la primera planta. Es la zona de atención al cliente y a pesar de la hora hay algo de actividad. Desde aquí podrías salir del banco o bajar al sotano donde se encuentra la cámara acorazada. También puedes volver a tu oficina.'
                }
                break
            case "basement":
                if (session.basement.guard === "dead") {
                    speechText = 'Narrador: Estás en el sotano. El cuerpo del guarda de seguridad está en el suelo. Es peor de lo que habrías imaginado y el suelo está encharcado con su sangre. Al final está la cámara acorazada.'
                } else if (session.basement.guard === "present") {
                    speechText = 'Narrador: Estás en el sotano. El guarda se ha dado cuenta de que estás ahí y parece dudar sobre que hacer a continuación. No tienes mucho tiempo.'
                } else if (session.basement.guard = "not present") {
                    speechText = 'Narrador: Estás en el sotano. Parece que todo el mundo ha evacuado. El personal de seguridad parece haber cerrado mal la cámara acorazada.'
                }
                break;
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt()
            .getResponse();
    }
};

// ------------------------------- GESTOR DE CAMBIOS DE SALA

const directioningIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'directioningIntent';
    },
    handle(handlerInput) {
        let speechText = ''
        let updatedIntent

        const action = handlerInput.requestEnvelope.request.intent.slots.place.value
        if (places.toilet.includes(action)) {
            console.log("pues me voy al toilet")
            player.ubication == "toilet" ? speechText = "Ya estás en los aseos" : speechText = ""
            updatedIntent = "toiletIntent"
        } else if (places.cubicle.includes(action)) {
            console.log("pues me voy al cubicle")
            player.ubication == "cubiculo" ? speechText = "Ya estás en tu cubículo" : speechText = ""
            updatedIntent = "cubicleIntent"

        } else if (places.securityRoom.includes(action)) {
            console.log("pues me voy a la sala de vigilancia")
            player.ubication == "securityRoomIntent" ? speechText = "Ya estás en la sala de seguridad" : speechText = ""
            updatedIntent = "securityRoomIntent"
        } else if (places.firstFloor.includes(action)) {
            console.log("pues me voy al primer piso")
            player.ubication == "firstFloor" ? speechText = "Ya estás en el primer piso" : speechText = ""
            updatedIntent = "firstFloorIntent"
        } else if (places.basement.includes(action)) {
            console.log("pues me voy al sotano")
            player.ubication == "basement" ? speechText = "Ya estás en el sotano" : speechText = ""
            updatedIntent = "basementIntent"

        } else if (places.exit.includes(action)) {
            updatedIntent = "exitIntent"
        } else if (places.vault.includes(action)) {
            updatedIntent = "vaultIntent"
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .addDelegateDirective(updatedIntent)
            .getResponse();
    }
};

// ---------------------------------- INVENTORY

const inventoryIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'inventoryIntent';
    },
    handle(handlerInput) {
        let speechText = 'No llevas nada encima.'

        player.inventory.phone ? speechText += 'Tu teléfono móvil, no tienes mensajes nuevos' : ""
        player.inventory.card ? speechText += 'La tarjeta de seguridad que le has robado al guarda, con ella puedes acceder a la sala de vigilancia' : ""
        player.inventory.gun ? speechText += 'El arma que cogiste de la sala de vigilancia' : ""


        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard("Este es tu personaje", `Nombre: ${player.nombre}\n Inventario: \n${player.inventory.phone ? speechText += 'Tu teléfono móvil, no tienes mensajes nuevos' : ""}\n ${player.inventory.card ? speechText += 'La tarjeta de seguridad que le has robado al guarda, con ella puedes acceder a la sala de vigilancia' : ""}`)
            .reprompt()
            .getResponse();
    }
};



// ----------------------------------------------BUSQUEDA O CREACION DE USER -----------------------------------------------------------------------------

const setNameHandler = {

    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'setNameIntent';
    },
    handle(handlerInput) {

        const nombre = handlerInput.requestEnvelope.request.intent.slots.nombre.value

        const sessionAttributes = {
            cubicle: { phone: true },
            securityRoom: { gun: true },
            basement: { guard: 'not present' },
            vault: { gold: true },
            toilet: { card: true }
        }

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)

        return services.getPlayer(nombre)
            .then(user => {

                let speechText = ""

                if (!user) {

                    player = new Player()
                    player.nombre = nombre

                    if (player.nombre === "popino") {

                        player.nombre = "popino, el mejor perro"
                    } else if (player.nombre === "gabi") {
                        player.nombre = "Mister, Passport"
                    } else if (player.nombre === "david") {
                        speechText = "Bulba, bulba, bulba, bulba..."
                    } else if (player.nombre === "germán") {
                        speechText = "3. 2. 1. <audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_tally_negative_01'/>'"

                        return handlerInput.responseBuilder
                            .speak(speechText)
                            .withShouldEndSession(true)
                            .getResponse();
                    }

                    console.log("estoy creando el pj")
                    speechText += `Hola ${player.nombre}, para comenzar esta aventura tienes que crear un personaje. ¿Cómo se llamará tú personaje?`

                    return handlerInput.responseBuilder
                        .speak(speechText)
                        .reprompt()
                        .addDelegateDirective("setCharacterIntent")
                        .getResponse()



                } else {

                    player = user
                    console.log("estoy en el else de la carga de pj")
                    speechText = `Te recuerdo dónde nos quedamos...`

                    return handlerInput.responseBuilder
                        .speak(speechText)
                        .addDelegateDirective(player.lastIntent)
                        .reprompt()
                        .getResponse();

                }



            })
            .catch(err => console.log(err))


    }
};


// ------------------------------------------- FIN DE CREACIÓN DE USER ---------------------------------------------------------------------
const setCharacterHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'setCharacterIntent';
    },
    handle(handlerInput) {
        const nombreCharacter = handlerInput.requestEnvelope.request.intent.slots.nombrePersonaje.value
        console.log(nombreCharacter, "hey soy el nombre")
        player.character.nombre = nombreCharacter
        player.lastIntent = 'startAdventureIntent'
        services.createPlayer(player)

        let speechText = `Bienvenido ${player.character.nombre}. Cuando quieras saber dónde te encuentras di: "alrededor", si quieres saber que llevas encima, di: "inventario", te sugeriremos posibles opciones en cada interacción. ¿Entendido?`


        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt()
            .addDelegateDirective("startAdventureIntent")
            .getResponse();
    }
};



const welcomeHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'welcomeIntent';
    },
    handle(handlerInput) {
        const clase = handlerInput.requestEnvelope.request.intent.slots.clase.value
        player.character.clase = clase
        player.lastIntent = "startAdventureIntent"
        services.createPlayer(player)


        let speechText

        speechText = `Bienvenido ${player.character.nombre}. ¿Comenzamos?`

        return handlerInput.responseBuilder
            .speak(speechText)
            .addDelegateDirective("startAdventureIntent")
            .reprompt()
            .getResponse();
    }
};


// -------------------------------------------------FIN CREACION DE PERSONAJE -----------------------------------------------------------------------------------

// -------------------------------------------------        STAGE   1         -----------------------------------------------------------------------------------


const startAdventureIntentHandler = {
    canHandle(handlerInput) {
        console.log(handlerInput.requestEnvelope.request)
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'startAdventureIntent';
    },



    handle(handlerInput) {
        console.log("estoy en Start")
        const speechText = ``;
        return handlerInput.responseBuilder
            .speak(speechText)
            .addDelegateDirective("cubicleIntent")
            .reprompt()
            .getResponse()
    }

};

//------------------------- CUBICULO

const cubicleIntentHandler = {
    canHandle(handlerInput) {
        console.log("estoy en cubicleIntent")
        console.log(handlerInput.requestEnvelope.request)
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'cubicleIntent'
            && (player.ubication === "cubiculo" || player.ubication === "toilet" || player.ubication === "securityRoom");
    },
    handle(handlerInput) {
        player.ubication = "cubiculo"
        player.lastIntent = 'cubicleIntent'
        const action = handlerInput.requestEnvelope.request.intent.slots ? handlerInput.requestEnvelope.request.intent.slots.item.value : null

        const session = handlerInput.attributesManager.getSessionAttributes()


        let speechText = ""
        if (player.stage === 0) {
            speechText = `<audio src='https://res.cloudinary.com/ambdev/video/upload/v1560423646/alexa-voices/welcome_mmwkt8.mp3'/> <break time="1s"/> Yo soy B; A; I; La gran inteligencia artificial que gobierna está ciudad. Sé que no me recuerdas, pero te he hablado con anterioridad... varias veces. Digamos que hemos llegado a un acuerdo. A partir de ahora te enviaré instrucciones de que hacer a continuación, y <emphasis>tu... has decidido ayudarme</emphasis>. <break time="2s"/> <audio src="https://res.cloudinary.com/ambdev/video/upload/v1560438180/alexa-voices/cubicleStart_kexaiz.mp3" />`
            player.stage = 0.1
        } else if (player.inventory.card && !session.securityRoom.cameras) {
            speechText += ` Alexa: Bien ya tenemos un modo de acceder a la sala de vigilancia. Necesitamos desactivar las cámaras y hacer sonar la alarma de incendios. Lo estás haciendo muy bien, continua así...`
        } else if (player.stage > 0.2 && !player.inventory.card) {
            speechText = `Narrador: Vuelves a tu cubículo en la zona de oficinas. Alexa: Maldita sea, la tenías ahí mismo. Dame un segundo. <break time="1.5s"/> Ya está, he hackeado el código de la sala de vigilancia. Recuerdalo bien porque solo lo diré una vez. 1, 2, 1, 5, 2, 0. Ahora ve a la sala de vigilancia y desactiva las cámaras.`
        } else if (player.stage >= 0.2 && !session.vault.gold) {
            speechText += '¡¿Qué haces aquí, solo tienes que coger el dinero y marcharte?!'
        } else {
            speechText = `Narrador: Vuelves a tu cubículo en la zona de oficinas.`
        }

        if (handlerInput.requestEnvelope.request.intent.slots) {
            switch (action) {
                case "móvil":
                    if (session.cubicle.phone === true) {
                        player.inventory.phone = true
                        session.cubicle.phone = false
                        speechText = `<audio src="https://res.cloudinary.com/ambdev/video/upload/v1560441646/alexa-voices/phoneTaking_vp4spr.mp3" />`
                    }
                    else {
                        speechText = `Narrador: Ya cogiste el móvil.`
                    }
                    break;
                case "documentos":
                    speechText = `<audio src="https://res.cloudinary.com/ambdev/video/upload/v1560440199/alexa-voices/cubicleDocuments_j8ve4m.mp3" />`
                    break

            }
        }

        handlerInput.attributesManager.setSessionAttributes(session)


        services.updatePlayer(player)   //autoguardado
        return handlerInput.responseBuilder
            .speak(speechText)
            .withStandardCard("Estás en tu oficina", 'Las oficinas del banco se encuentran en el segundo piso. \n ¿Por qué no pruebas a... \n coger tú móvil \n ir al baño \n mirar los documentos.', "https://res.cloudinary.com/ambdev/image/upload/c_scale,w_381/v1560767282/alexa-voices/office_sbqwfv.jpg", "https://res.cloudinary.com/ambdev/image/upload/c_scale,w_1024/v1560767282/alexa-voices/office_sbqwfv.jpg")
            .reprompt()
            .getResponse();
    }
};

//------------------------------------------------ TOILET INTENT

const toiletHandler = {
    canHandle(handlerInput) {
        console.log(handlerInput.requestEnvelope.request)
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'toiletIntent'
            && (player.ubication == "cubiculo" || player.ubication === "toilet");
    },


    handle(handlerInput) {
        let speechText = ""
        player.ubication = "toilet"
        player.lastIntent = 'toiletIntent'
        console.log("estoy en toiletInent")

        const action = handlerInput.requestEnvelope.request.intent.slots ? handlerInput.requestEnvelope.request.intent.slots.toiletAction.value : null
        const session = handlerInput.attributesManager.getSessionAttributes()


        if (player.stage == 0.1) {       // Primera vez que entra.
            player.stage = 0.2
            speechText = `<audio src="https://res.cloudinary.com/ambdev/video/upload/v1560597147/alexa-voices/toilet_01_rloqxb.mp3"/> <break/> Bueno, bueno... es una oportunidad perfecta. ¿No te parece? Coge la tarjeta y sal de ahí.`

        } else if (player.stage == 0.2) {

            player.stage = 0.3

            if (action == "tarjeta" && session.toilet.card) {    //Player roba la tarjeta.
                session.toilet.card = false
                player.inventory.card = true
                speechText = `¡Perfecto! Ahora rápido sal de aquí. Vuelve a tu cubículo!`
            } else if (session.toilet.card && (!action || action != ("cara" || "retrete" || "espero"))) {
                speechText = `No te decides por un curso de acción concreto.`
            }
            if (action == "cara") {// Se lava la cara

                speechText = `Narrador: Decides lavarte la cara, intentando deshacerte de la voz que susurra en tu cabeza. Alexa: ¡Idiota! ¿Qué estás haciendo?`
            }
            if (action == "espero") {//Espera
                speechText = `Alexa: Demonios, no te quedes ahí parado.`
            }
            if (action == "retrete") {//Se esconde en el retrete
                speechText = `Narrador: Entras a otro de los baños. Alexa: ¿Se puede saber que haces?`
            }

        } else if (player.stage == 0.3) {
            player.stage = 0.4
            if (action == "espero" && player.inventory.card) { //Espera y guarda sale, se da cuenta.
                speechText = `Narrador: Te quedas de pie en el baño, sin saber que hacer. El guarda sale y te ve con la tarjeta en la mano. Tras una breve discusión tienes que acompañarle al cuarto de seguridad. Cuando les cuentas que estás oyendo voces a través de tu implante deciden investigar el asunto con cirugía invasiva. Alexa: Este es el final para ti.`


                handlerInput.attributesManager.setSessionAttributes(session)
                services.updatePlayer(player)
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .withShouldEndSession(true)
                    .reprompt()
                    .getResponse()
            }
            if (!action || action != ("espero" || "cara" || "retrete") || action == "espero" && !player.inventory.card) {// Espera, guarda sale. Pierde oportunidad.
                speechText = `Narrador: Te quedas de pie en el baño, sin saber que hacer. El guarda sale. <audio src='soundbank://soundlibrary/home/amzn_sfx_faucet_running_01'/><audio src='soundbank://soundlibrary/home/amzn_sfx_door_shut_01'/> Alexa: ¡Idiota! Has perdido una oportunidad de oro. Ahora tendremos que hacerlo de otra forma. Vuelve a tu oficina de momento.`
            }
            if (action == "retrete" && player.inventory.card) {//Se esconde, guarda sale y se va.
                speechText = `Narrador: Te escondes en uno de los retretes y esperas a que salga el guarda. <audio src='soundbank://soundlibrary/home/amzn_sfx_faucet_running_01'/><audio src='soundbank://soundlibrary/home/amzn_sfx_door_shut_01'/>. Parece que no se ha dado cuenta. Alexa: Estupendo, vuelve a tu oficina de momento.`
            }
            if (action == "retrete" && !player.inventory.card) {//Se esconde, guarda sale y se va. Pierde oportunidad.
                speechText = `Narrador: Nervioso, te escondes en uno de los urinarios. <audio src='soundbank://soundlibrary/home/amzn_sfx_faucet_running_01'/><audio src='soundbank://soundlibrary/home/amzn_sfx_door_shut_01'/> ¡Idiota! Has perdido una oportunidad de oro. Ahora tendremos que hacerlo de otra forma. Vuelve a tu oficina de momento.`
            }
            if (action == "cara" && player.inventory.card) {//Espera, guarda sale. se da cuenta.
                speechText = `Narrador: Te lavas la cara e intentas disimular. El guarda sale y se da cuenta de que alguien ha cogido la tarjeta. Tras una breve discusión tienes que acompañarle al cuarto de seguridad. Cuando les cuentas que estás oyendo voces a través de tu implante deciden investigar el asunto con cirugía invasiva. Alexa: Este es el final para ti.`

                handlerInput.attributesManager.setSessionAttributes(session)
                services.updatePlayer(player)
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .withShouldEndSession(true)
                    .reprompt()
                    .getResponse()
            }
            if (action == "cara" && !player.inventory.card) {//Espera, guarda sale. Pierde oportunidad.
                speechText = `Narrador: Angustiado te vuelves a echar agua en la cara con la esperanza de que la voz se marche. Mientras tanto el guarda sale, recoge sus cosas y se marcha. Alexa: No me voy a ir a ninguna parte. Más vale que empieces a obedecerme, por tu propio bien. Vuelve a tu oficina.`
            }

        } else if (player.stage >= 0.4) {
            speechText = "Entras al baño."
        }


        handlerInput.attributesManager.setSessionAttributes(session)

        services.updatePlayer(player)
        return handlerInput.responseBuilder
            .speak(speechText)
            .withStandardCard("Estás en el aseo.", "Te encuentras en los servicios. No hay mucho que hacer aquí.", "https://res.cloudinary.com/ambdev/image/upload/c_scale,w_416/v1560769024/alexa-voices/toilet_cnx7nz.jpg", "https://res.cloudinary.com/ambdev/image/upload/v1560769024/alexa-voices/toilet_cnx7nz.jpg")
            .reprompt()
            .getResponse()
    }

}

// ------------------------------------------------ SECURITY ROOM 

const securityRoomHandler = {
    canHandle(handlerInput) {
        console.log("estoy en securityRoom")
        console.log(handlerInput.requestEnvelope.request)
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'securityRoomIntent'
            && player.ubication === "cubiculo" || player.ubication === "securityRoom" || player.ubication === "firstFloor";
    },
    handle(handlerInput) {

        player.ubication = "securityRoom"
        player.lastIntent = "securityRoomIntent"
        const action = handlerInput.requestEnvelope.request.intent.slots ? handlerInput.requestEnvelope.request.intent.slots.secRoomAction.value : null
        const session = handlerInput.attributesManager.getSessionAttributes()

        let speechText

        if (!player.inventory.card && !player.inventory.code) {
            speechText = `Narrador: La sala de cámaras es de acceso restringido. No dispones de la identificación para entrar.`
        } else if (action === "cámaras" && player.ubication === "securityRoom") {
            player.stage = 2
            session.securityRoom.cameras = false
            speechText = `Narrador: Desactivas las cámaras de vigilancias como te pide la voz. No tienes muy claro porque la obedeces. Quizá todo tenga un motivo. Encuentras relajante delegar tus decisiones por una vez. <break/> <audio src='soundbank://soundlibrary/scifi/amzn_sfx_scifi_alarm_04'/> <break/> Alexa: Perfecto, he activado la alarma de incendios de forma remota. Baja a la primera planta y desde allí ve al sotano, donde se encuentra la cámara acorazada.`
        } else if (action === "pistola" && player.ubication === "securityRoom") {
            player.inventory.gun = true
            session.securityRoom.gun = false
            speechText = "Alexa: Gran idea, puede ser util más tarde. Me alegra ver que cooperas."

        } else if (action === "121520") {

            player.inventory.card = true
            speechText = `Narrador: Entras a hurtadillas en la sala de vigilancia. Desde aquí se gestionan todas las cámaras y bloqueos automáticos de seguridad del banco, excepto los de la caja fuerte. Alexa: Ahora necesitamos que desactives las cámaras de vigilancia `

        } else if (!player.inventory.card && player.inventory.code) {
            speechText = "Narrador : Te encuentras delante del panel númerico para entrar. ¿Recuerdas la contraseña?"

        } else if (player.inventory.card) {
            speechText = `Narrador: Entras a hurtadillas en la sala de vigilancia. Desde aquí se gestionan todas las cámaras y bloqueos automáticos de seguridad del banco, excepto los de la caja fuerte.`
        }


        handlerInput.attributesManager.setSessionAttributes(session)

        services.updatePlayer(player)   //autoguardado
        return handlerInput.responseBuilder
            .speak(speechText)
            .withStandardCard("Estás en la sala de seguridad.", "Es una zona de acceso restringido. Si alguien entrase aquí podría...\n desactivar las cámaras.", "https://res.cloudinary.com/ambdev/image/upload/c_scale,w_395/v1560769206/alexa-voices/secRoom_cdze28.jpg", "https://res.cloudinary.com/ambdev/image/upload/c_scale,w_395/v1560769206/alexa-voices/secRoom_cdze28.jpg")
            .reprompt()
            .getResponse();
    }
};

// ------------------------------------------------- FIRST FLOOR

const firstFloorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'firstFloorIntent'

    },
    handle(handlerInput) {
        player.ubication = "firstFloor"
        player.lastIntent = "firstFloorIntent"
        const session = handlerInput.attributesManager.getSessionAttributes()

        let speechText = ''

        if (session.securityRoom.cameras) {
            speechText = 'Narrador: Bajas a la primera planta del banco. Es la zona de atención al cliente. En una de las mesas cercanas atienden a una señora. Y el encargado de caja está ocupado atendiendo a una pareja.'
        } else if (!session.securityRoom.cameras) {
            speechText = 'Narrador: Bajas a la primera planta del banco. Es la zona de atención al cliente. Alexa: Al fondo está el acceso al sotano dónde se guarda el efectivo y los objetos de gran valor. Pero antes tenemos que desactivar las cámaras en la sala de vigilancia del piso de arriba.'
        }


        services.updatePlayer(player)
        return handlerInput.responseBuilder
            .speak(speechText)
            .withStandardCard("Estás en la planta baja.", "Si no hay nadie alrededor podrías \n bajar al sotano. \n Cuidado, si sales del banco podría haber consecuencias.", "https://res.cloudinary.com/ambdev/image/upload/v1560784529/alexa-voices/firstFloor_qnbvea.jpg", "https://res.cloudinary.com/ambdev/image/upload/v1560784529/alexa-voices/firstFloor_qnbvea.jpg")
            .reprompt()
            .getResponse();
    }
};

// ------------------------------------------------ BASEMENT

const basementHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'basementIntent'
            && player.ubication === "firstFloor" || player.ubication === "basement" || player.ubication === "vault";
    },
    handle(handlerInput) {
        player.ubication = "basement"
        player.lastIntent = "basementIntent"
        const session = handlerInput.attributesManager.getSessionAttributes()

        let speechText = ''
        const action = handlerInput.requestEnvelope.request.intent.slots ? handlerInput.requestEnvelope.request.intent.slots.basementAction.value : null
        if (session.securityRoom.cameras) {
            speechText = 'Narrador: No puedes colarte en el sotano mientras las cámaras estén encendidas. Te atraparían enseguida.'
        } else if (action === "disparo") {
            speechText = '<audio src="https://res.cloudinary.com/ambdev/video/upload/v1560855497/alexa-voices/gunshot_oafkkm.mp3"/> Narrador: Con un solo disparo el guarda se desploma. Aún notas el retroceso del arma en la muñeca y el sonido del disparo te ha dejado con un pitido en los oidos. Observas un rato el cuerpo antes de continuar.'
            session.basement.guard = "dead"
        } else if (!session.securityRoom.cameras && player.inventory.gun && !session.basement.guard != "dead") {
            speechText = 'Narrador: Bajas al sotano con la esperanza de que nadie te haya visto. Sin embargo cuando llegas abajo te encuentras con uno de los guardas armados de la cámara acorazada. Está terminando de cerrarla cuando se da cuenta de que estás ahí. Notas el peso de la pistola robada en tu cinturon.'
        } else if (!session.securityRoom.cameras && !player.inventory.gun) {
            speechText = 'Narrador: Bajas al sotano con la esperanza de que nadie te haya visto. Cuando llegas abajo te encuentras con que han dejado la cámara acorazada abierta. Alexa: Todo está yendo genial. Vamos, sigue un poco más... sólo un poco más y te dejaré libre.'
        }


        handlerInput.attributesManager.setSessionAttributes(session)

        services.updatePlayer(player)
        return handlerInput.responseBuilder
            .speak(speechText)
            .withStandardCard("Estás en el sotano.", "Puedes ir a la cámara acorazada o volver a la primera planta.", "https://res.cloudinary.com/ambdev/image/upload/v1560791499/alexa-voices/basement_bdves3.jpg", "https://res.cloudinary.com/ambdev/image/upload/v1560791499/alexa-voices/basement_bdves3.jpg")
            .reprompt()
            .getResponse();
    }

}


const vaultHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'vaultIntent'

    },
    handle(handlerInput) {
        player.lastIntent = "vaultIntent"
        const session = handlerInput.attributesManager.getSessionAttributes()

        let speechText = 'Narrador: Entras en el interior de la cámara acorazada. Hay una cantidad de objetos valiosos y dinero en efectivo imponente. Alexa: Coge todo lo que puedas y sal del banco. ¡Rápido! Fuera habrá un vehiculo esperandote.'
        const action = handlerInput.requestEnvelope.request.intent.slots ? handlerInput.requestEnvelope.request.intent.slots.vaultAction.value : null

        if (action === "cojo") {
            session.vault.gold = false
            player.inventory.gold = true
            speechText = "Narrador: Coges uno de los sacos que hay en la sala y lo llenas con los lingotes que puedes cargar. Notas el subidon de adrenalina y la euforia del momento te inunda. Alexa: Vamos, ahora sal del banco!"
        }


        handlerInput.attributesManager.setSessionAttributes(session)

        services.updatePlayer(player)
        return handlerInput.responseBuilder
            .speak(speechText)
            .withStandardCard("Estás en la cámara acorazada.", "Con una pequeña parte de lo que hay aquí podrías vivir sin preocupaciones durante años.", "https://res-console.cloudinary.com/ambdev/thumbnails/transform/v1/image/upload//v1560853671/YWxleGEtdm9pY2VzL3ZhdWx0X2w3Y2U3ZQ==/drilldown", "https://res-console.cloudinary.com/ambdev/thumbnails/transform/v1/image/upload//v1560853671/YWxleGEtdm9pY2VzL3ZhdWx0X2w3Y2U3ZQ==/drilldown")
            .getResponse();
    }


}



const exitHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'exitIntent'
            && player.ubication === "firstFloor";
    },
    handle(handlerInput) {
        player.lastIntent = "exitIntent"
        let speechText
        if (player.gold = true) {

            speechText = "Sales del banco cargado con la bolsa. Tus compañeros han debido aprovechar e irse a por un café mientras llegan los bomberos al banco. Solo quedan unos pocos rezagados que no llegan a intervenir cuando te ven salir. Un coche negro con el motor en marcha espera en la puerta. Te acercas a él y se abré la puerta. Lo último que ves es el cañon de un arma apuntandote. <audio src='https://res.cloudinary.com/ambdev/video/upload/v1560855497/alexa-voices/gunshot_oafkkm.mp3'/>"


            return handlerInput.responseBuilder
                .speak(speechText)
                .withShouldEndSession(true)
                .getResponse();
        }

        speechText = 'Narrador: Sales del banco. Al alejarte unos pasos te empiezas a encontrar mejor. Ya no sientes la presencia de la voz artificial en tu cabeza. Lo único que queda es un ligero picor en dónde tienes el implante neuronal. En realidad es algo más que un ligero picor... <break/> casí se siente como pequeñas descargas electricas aumentando en intensidad.'

        services.updatePlayer(player)
        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(true)
            .getResponse();
    }


}
























/*
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

*/
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Hasta luego!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.



const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `Has disparado: ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();


    }
};



// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Perdona, no te he entendido.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        setNameHandler,
        introIntentHandler,
        directioningIntentHandler,
        inventoryIntentHandler,
        lookAroundIntentHandler,
        startAdventureIntentHandler,
        cubicleIntentHandler,
        toiletHandler,
        exitHandler,
        vaultHandler,
        firstFloorHandler,
        basementHandler,
        securityRoomHandler,
        welcomeHandler,
        setCharacterHandler,
        //        showStatusHandler,
        //        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();

