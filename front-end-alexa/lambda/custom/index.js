// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.



const Alexa = require('ask-sdk-core');
const Player = require ("./players")
const Services = require("./services")
const services = new Services()

let player

const cubicle = {
    phone: true
}

const places = {
    toilet: ['toilet', 'baño', 'aseos', 'servicio'],
    cubicle: ['cubiculo', 'cubículo', 'oficina', 'mi cubiculo', 'mi cubículo']
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Bienvenido a una nueva aventura! Indica tu partida diciendo "partida de", seguido de tu nombre. Si no tienes una partida guardada se creará una.';
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

const introIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'introIntent';
            },
    handle(handlerInput) {
        const speechText = `Año 2132, vives en la ciudad de Nueva Nueva York, trabajas en el Grand Central Bank cómo técnico de soporte. La rutina es agradable y el trabajo no trae demasiadas sorpresas. Hasta que B; A; I;, la inteligencia artificial que se encuentra a cargo de la ciudad, conecta contigo a través de tú implante neuronal estandar. Escuchas lo que te propone, sorprendido piensas sobre si aceptar o no, parece una locura y no sabes si serás capaz de conseguirlo. Decides aceptar y BAI borra de tu memoria superficial todo rastro de la información confidencial que te ha transmitido...`
        return handlerInput.responseBuilder
            .speak(speechText)
//            .addDelegateDirective(player.lastIntent)
            .reprompt()
            .getResponse();
    }
};


const lookAroundIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'lookAroundIntent';
    },
    handle(handlerInput) {
        let speechText = ''
        switch(player.ubication) {
            case "cubiculo":
                
                if(cubicle.phone) {speechText = `<audio src='soundbank://soundlibrary/office/amzn_sfx_copy_machine_01'/>
                    <audio src="https://res.cloudinary.com/ambdev/video/upload/v1560437094/alexa-voices/cubiculoLocation.mp3_fvkysg.mp3"/>`  
                } else {
                    speechText = `<audio src='soundbank://soundlibrary/office/amzn_sfx_copy_machine_01'/>
                            <audio src="https://res.cloudinary.com/ambdev/video/upload/v1560439487/alexa-voices/cubicleNoPhone_xxgafh.mp3"/>`
                }
                
                break
            case "toilet":
                if(player.stage===0.2){
                    speechText = `Narrador: Te encuentras en los baños. Sobre el lavabo están la tarjeta del guarda y su teléfono. Oyes al guarda de seguridad dentro del aseo, no tardará mucho en salir.`
                }
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt()
            .getResponse();
    }
};



const directioningIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'directioningIntent';
    },
    handle(handlerInput) {
        let speechText = ''
        let updatedIntent
        if(places.toilet.includes(handlerInput.requestEnvelope.request.intent.slots.place.value)){
                console.log("pues me voy al toilet")
                updatedIntent = "toiletIntent"
        } else if(places.cubicle.includes(handlerInput.requestEnvelope.request.intent.slots.place.value)) {
                console.log("pues me voy al cubicle")
                updatedIntent = "cubicleIntent"

        }


        return handlerInput.responseBuilder
            .speak(speechText)
            .addDelegateDirective(updatedIntent)
            .getResponse();
    }
};



const inventoryIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'inventoryIntent';
    },
    handle(handlerInput) {
        let speechText = 'Tienes en tu posesión: '
        if(Object.keys(player).length === 0){
            speechText = "No llevas nada encima."
        } else { 
            player.inventory.phone ? speechText += 'tu teléfono móvil, no tienes mensajes nuevos' : null
            
        }


        return handlerInput.responseBuilder
            .speak(speechText)
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
        
        return services.getPlayer(nombre)
                .then(user => {
            
            let speechText
            
             if(!user) {
                 
                player = new Player()
                player.nombre = nombre
                
                    console.log("estoy creando el pj")
                speechText = `Hola ${player.nombre}, para comenzar esta aventura tienes que crear un personaje. ¿Cómo se llamará tú personaje?`
              
                return handlerInput.responseBuilder
                    .speak(speechText) 
                    .reprompt()
                    .addDelegateDirective("setCharacterIntent")
                    .getResponse()
               //     .reprompt('add a reprompt if you want to keep the session open for the user to respond')
                 
                 
                    
             } else {
                 
                player = user
                console.log("estoy en el else de la carga de pj")
                speechText = `Te recuerdo dónde nos quedamos...`
                
                return handlerInput.responseBuilder
                    .speak(speechText) 
                    .addDelegateDirective(player.lastIntent)
                    .reprompt()
                    .getResponse();        
                    //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                
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

        let speechText = `Bienvenido ${player.character.nombre}. Cuando quieras saber dónde te encuentras di: "alrededor", si quieres saber que llevas encima, di: "inventario", te sugeriremos posibles opciones en cada interacción.`        
        

        return handlerInput.responseBuilder
            .speak(speechText)
            .addDelegateDirective("startAdventureIntent")
            .getResponse();
    }
};



const setCharacterClassHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'setCharacterClassIntent';
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
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};


// -------------------------------------------------FIN CREACION DE PERSONAJE -----------------------------------------------------------------------------------

// -------------------------------------------------        STAGE   1         -----------------------------------------------------------------------------------


const startAdventureIntentHandler = {
    canHandle(handlerInput) {
        console.log(handlerInput.requestEnvelope.request)
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'startAdventureIntent'
            && player.stage == 0;
    },
    
    
    handle(handlerInput) {
        console.log("estoy en Start")
        const speechText = `<audio src='https://res.cloudinary.com/ambdev/video/upload/v1560423646/alexa-voices/welcome_mmwkt8.mp3'/> <break time="1s"/> Yo soy B; A; I; La gran inteligencia artificial que gobierna está ciudad. Sé que no me recuerdas, pero te he hablado con anterioridad... varias veces. Digamos que hemos llegado a un acuerdo. A partir de ahora te enviaré instrucciones de que hacer a continuación, y <emphasis>tu... has decidido ayudarme</emphasis>.`;
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt()
            .getResponse()
    }
    
};


const cubicleIntentHandler = {
    canHandle(handlerInput) {
        console.log("estoy en cubicleIntent")
        console.log(handlerInput.requestEnvelope.request)
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'cubicleIntent'
            && (player.ubication=== "cubiculo" || player.ubication === "toilet");
    },
    handle(handlerInput) {
        let speechText
        if(player.stage== 0) {
            speechText = `<audio src="https://res.cloudinary.com/ambdev/video/upload/v1560438180/alexa-voices/cubicleStart_kexaiz.mp3" />`
            player.stage = 0.1
        }
        
        if(handlerInput.requestEnvelope.request.intent.slots.item.value) {
            switch(handlerInput.requestEnvelope.request.intent.slots.item.value) {
                case "móvil":
                    player.inventory.phone = true
                    cubicle.phone = false
                    speechText = `<audio src="https://res.cloudinary.com/ambdev/video/upload/v1560441646/alexa-voices/phoneTaking_vp4spr.mp3" />`
                    break;
                case "documentos":
                    speechText = `<audio src="https://res.cloudinary.com/ambdev/video/upload/v1560440199/alexa-voices/cubicleDocuments_j8ve4m.mp3" />`
                    break
                
            } 
        }
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt()
            .getResponse();
    }
}; 

const toiletHandler = {
        canHandle(handlerInput) {
        console.log(handlerInput.requestEnvelope.request)
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'toiletIntent'
            && (player.ubication == "cubiculo" || player.ubication === "toilet")
            && player.stage > 0;
    },
    
    
    handle(handlerInput) {
        let speechText = ""
        player.ubication = "toilet"
        console.log("estoy en toiletInent")
        
        if(player.stage == 0.1) {       // Primera vez que entra.
            player.stage = 0.2
            speechText = `<audio src="https://res.cloudinary.com/ambdev/video/upload/v1560597147/alexa-voices/toilet_01_rloqxb.mp3"/> <break/> Bueno, bueno... es una oportunidad perfecta. ¿No te parece? Coge la tarjeta y sal de ahí.`
                
        } else if (player.stage == 0.2) { 
           
            player.stage = 0.3
            
            if(handlerInput.requestEnvelope.request.intent.slots.toiletAction.value == "tarjeta"){    //Player roba la tarjeta.
                    console.log(player)

                player.inventory.card = true
                speechText = `¡Perfecto! Ahora rápido sal de aquí. Vuelve a tu cubículo!`
            } 
            if(handlerInput.requestEnvelope.request.intent.slots.toiletAction.value == "cara") {// Se lava la cara
             
                speechText = `Narrador: Decides lavarte la cara, intentando deshacerte de la voz que susurra en tu cabeza. Alexa: ¡Idiota! ¿Qué estás haciendo?`
            }
            if(handlerInput.requestEnvelope.request.intent.slots.toiletAction.value == "esperar") {//Espera
                speechText = `Alexa: Demonios, no te quedes ahí parado.`
            }
            if(handlerInput.requestEnvelope.request.intent.slots.toiletAction.value == "retrete") {//Se esconde en el retrete
                speechText = `Narrador: Entras a otro de los baños. Alexa: ¿Se puede saber que haces?`
            }
            
        } else if (player.stage == 0.3) { 
            player.stage = 0.4
            if(handlerInput.requestEnvelope.request.intent.slots.toiletAction.value == "esperar" && player.inventory.card)  { //Espera y guarda sale, se da cuenta.
                speechText = `Narrador: Te quedas de pie en el baño, sin saber que hacer. El guarda sale y te ve con la tarjeta en la mano. Tras una breve discusión tienes que acompañarle al cuarto de seguridad. Cuando les cuentas que estás oyendo voces a través de tu implante deciden investigar el asunto con cirujía invasiva. Alexa: Este es el final para ti.`
            }
            if(handlerInput.requestEnvelope.request.intent.slots.toiletAction.value == "esperar" && !player.inventory.card) {// Espera, guarda sale. Pierde oportunidad.
            
            }
            if(handlerInput.requestEnvelope.request.intent.slots.toiletAction.value == "retrete" && player.inventory.card) {//Se esconde, guarda sale y se va.
            
            }
            if(handlerInput.requestEnvelope.request.intent.slots.toiletAction.value == "retrete" && !player.inventory.card) {//Se esconde, guarda sale y se va. Pierde oportunidad.
            
            }
            if(handlerInput.requestEnvelope.request.intent.slots.toiletAction.value == "cara" && player.inventory.card) {//Espera, guarda sale. se da cuenta.
            
            }
            if(handlerInput.requestEnvelope.request.intent.slots.toiletAction.value == "cara" && !player.inventory.card) {//Espera, guarda sale. Pierde oportunidad.
            
            }
         
        } else {
            speechText = "entra en el else"
        }
        
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt()
            .getResponse()
    }
    
} 

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
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
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
//        setCharacterClassHandler,
        setCharacterHandler,
//        showStatusHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();

