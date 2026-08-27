const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  apellidoPaterno: { 
            type        : String, 
            required    : true,
            trim        : true, //elimina espacios innecesarios al inicio o al final del texto.
            lowercase   : true, //permite guardar en minúsculas
  },
  apellidoMaterno: { 
            type        : String, 
            required    : true,
            trim        : true,
            lowercase   : true, //permite guardar en minúsculas
  },
  nombres: { 
            type        : String, 
            required    : true,
            trim        : true, 
            lowercase   : true, //permite guardar en minúsculas
  },
  email: { 
            type        : String,
            required    : true,
            unique      : true, //valor único
            lowercase   : true, //permite guardar en minúsculas
            trim        : true
  },
  password:{
            type        : String,
            required    : true 
  },
  role: {
            type        : String,
            enum        : ['admin', 'organizer', 'user'],  //limita los valores posibles del rol
            default     : 'user'
  }
});
module.exports = mongoose.model('usuarios', usuarioSchema);