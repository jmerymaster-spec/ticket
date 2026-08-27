const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  Id: { 
            type        : String, 
            required    : true,
            trim        : True 
  },
  nombre: { 
            type        : String, 
            required    : true,
            trim        : True 
  }
});

module.exports = mongoose.model('Categoria', categoriaSchema);
