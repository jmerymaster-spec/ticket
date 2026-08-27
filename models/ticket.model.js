const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  idTicket:{
        type        : String,
        required    : true
  },
  user: {  //representa quién hizo la inscripción.
        type        : mongoose.Schema.Types.ObjectId,
        ref         : 'User',
        required    : true
  },
  evento: {
        type        : String, //mongoose.Schema.Types.ObjectId,
        ref         : 'Evento',
        required    : true
  },
  estado:{
        type        : String,
        enum        : ['active','cancelled'],
        default     : 'active'
  },
  cantidad:{
        type        : Number, 
        default     : 1, 
        min         : 1
  },
  codigo_reserva:{
        type        : String,
        unique      : true
  },
  fecha_creacion:{
        type        : Date,
        default     : null
  }


});

module.exports = mongoose.model('tickets', ticketSchema);
