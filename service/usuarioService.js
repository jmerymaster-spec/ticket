const validaEmail = function(pEmail) {
    const validator = require('validator');
    const esValido = validator.isEmail(pEmail);
    return(esValido);
};

const largoEmail = function(pEmail){
    const largo = texto.length;
    return(largo);
}

/*
const validaRegistro = async(apellido_paterno, apellido_materno, nombres, email, password, role) => {
        let esValido = true;
        if(apellido_paterno===null || apellido_materno===null || nombres===null || email===null || password===null || role===null){
            esValido = false;
        }
        return(esValido);
};

const normalizaEmail = async (req,res) => {
    const {email} = req.body
    const minuscula = email.toLowerCase().trim()
    return (minuscula)
}

const existeUsuario = async (pEmail) => {
    //console.log('pEmail:'+pEmail)
    const Usuario = require('../models/usuario.model');
    const usuarioExiste = await Usuario.findOne({ email: pEmail });
 
    if(usuarioExiste){
        
    }
    
}
*/
//module.exports = { validaEmail , validaRegistro, normalizaEmail, existeUsuario};

module.exports = { validaEmail };
