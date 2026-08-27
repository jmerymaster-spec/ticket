const { getUUID } = require('../utils/getUUID');
const usuarioService = require('../service/usuarioService');

const Usuario = require('../models/usuario.model');
const bcryptjs = require('bcrypt');
const saltRounds = 5;
const jwt = require('jsonwebtoken');
require('dotenv').config();

/***********************************************************************************************************************/
const getUsuarios = async (req, res, next) => {
  try {
    const usuarios = await Usuario.find(); 
    res.status(200).json(usuarios);
    next()
  } catch (error) {
    res.status(401).json({ ok:false, message: "Invalid TOKEN"});
  }
};

/***********************************************************************************************************************/
const insUsuario = async (req, res, next) => {
      const {apellidoPaterno, apellidoMaterno, nombres, email, password, role} = req.body;
      //const datosIngresados = {apellidoPaterno, apellidoMaterno, nombres, email, role};
      pEmail = email;
      let vRole = role;

      if(vRole!=='user'){
        return res.status(400).json({
          status:'error',
          message:'El rol sólo puede ser [user]'
        })        
      }

      //Valida que el email es ingresado
      if(email==null){
        return res.status(400).json({
          status:'error',
          message:'El email debe ser ingresado.'
        })
      }

      //Valida formato del email
      const validator = require('validator');
      const esValido = validator.isEmail(pEmail);  
      if(!esValido){
        return res.status(400).json({
          status:'error',
          message:'El formato del email no es válido.'
        })
      }   

      //Valida que email no exista
      const usuarioExiste = await Usuario.findOne({ email: pEmail });
      if(usuarioExiste){
        return res.status(409).json({
          status:'error',
          message:'Ya existe un usuario registrado con ese email.'
        })
      }
      
      //Valida que todos los campos sean ingresados
      if (!apellidoPaterno || !apellidoMaterno || !nombres || !email || !password ) {
        return res.status(400).json({
          status: 'error',
          message: 'Todos los campos son obligatorios'
        })
      }    
      
      vRole = 'user'

      //Normaliza email
      const normalizaEmail = email.toLowerCase().trim()

      //Valida quela contraseña tenga mínimo 8 caracteres
      if(password.length < 8){
        return res.send({message: 'El largo de la contraseña debe tener al menos 8 caracteres.'});
      }
      
      //Graba
      const passHash = await bcryptjs.hash(password,8);
      await Usuario.create({apellidoPaterno, apellidoMaterno, nombres, email:normalizaEmail, password:passHash, role:vRole});
      res.status(201).json({
          status  : 'success',
          message : 'Usuario registrado correctamente',
          datos   : {apellidoPaterno, apellidoMaterno, nombres, email, role:vRole}
      })
      next;
};

/***********************************************************************************************************************/
const login = async (req, res) => {
  const {email, password} = req.body;
  const vEmail = email;
  const busqueda = await Usuario.findOne({email:vEmail});
  const payload = {email:vEmail};

  if(!usuarioService.validaEmail(vEmail)){
    return res.send({message: 'El email no tiene formato correcto.'});
  }

  if(busqueda===null){
    return res.send({message: '(1).Error en las credenciales'});
  }

  if(busqueda!== null){
    const autenticado = await bcryptjs.compare(password,busqueda.password)
    if(autenticado!==true){
      return res.send({message: '(2).Error en las credenciales'});
    }else{
      const accessToken = generateAccessToken(payload);
      res.cookie("jwtTICKETS",accessToken)

      res
        .status(200)
        .json({
          ok:true,
          data:payload,
          message:"Inicio de sesión exitoso!"
        })

      //const vUUID = getUUID();
      //console.log(vUUID);
    }
  }
}

/***********************************************************************************************************************/
const logout = (req, res) => {
res.clearCookie('jwtTICKETS')
res.status(200).json({
    status: 'success',
    message: 'Logout correcto'
})
}

/***********************************************************************************************************************/
/***********************************************************************************************************************/
/***********************************************************************************************************************/

function generateAccessToken(payload){
  return jwt.sign(payload,process.env.JWT_CLAVE,{expiresIn:'10m'});
}

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract the token from the Authorization header
  if (!token) return res.status(403).send('A token is required for authentication'); // Return error if no token
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send('Invalid Token'); // Return error if token is invalid
    req.user = user; // Attach user data to request object for use in route handlers
    next(); // Pass control to the next middleware or route handler
  });
}

module.exports = { getUsuarios, insUsuario, login, logout };
