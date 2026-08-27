const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
{
        idEvento: {
            type:     String,
            required: true
        },
        titulo: { //nombre del evento
            type: String,
            required: true,
            trim: true
        },
        descripcion: { //permite explicar de qué trata el evento
            type: String,
            required: true,
            trim: true
        },
        categoria: { //Rock, Pop, Electronica, Kpop, Jazz, folklore
            type: String,
            //ref: 'categoria',
            required: true
        },
        fecha: {  //fecha y hora del evento
            type: Date,
            required: true
        },
        ubicacion: { //dónde ocurre el evento.
            type: String,
            required: true,
            trim: true
        },
        capacidad: { //cupo máximo
            type: Number,
            required: true,
            min: 1
        },
        precio: { //precio del evento
            type: Number,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            enum: [
                   'draft',      //representa un evento creado pero todavía no publicado
                   'published',  //representa un evento visible y disponible
                   'cancelled',  //representa un evento cancelado.
                   'finished'],  //representa un evento que ya ocurrió.
            default: 'draft' //representa un evento creado pero todavía no publicado
        },
        organizador: { //representa el usuario responsable del evento
            type: String,
            //ref: 'usuario',
            required: true
        },
        artista:{
            type    : String,
            required: true
        }
}
)

module.exports = mongoose.model('eventos', eventSchema);
