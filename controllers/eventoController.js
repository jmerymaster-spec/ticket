const { getUUID } = require('../utils/getUUID');

const Evento = require('../models/evento.model');
const Usuario = require('../models/usuario.model');

const bcryptjs = require('bcrypt');
const saltRounds = 5;
const jwt = require('jsonwebtoken');
const { ConnectionClosedEvent } = require('mongodb');
require('dotenv').config();

/***********************************************************************************************************************/
const getEventos = async (req, res) => {
  try {
    const { artista, categoria, descripcion, fecha } = req.query;
    const filter = {};

     if (artista) {
      filter.artista = { $regex: new RegExp(artista, 'i') };
    }
    
    if (categoria) {
      filter.categoria = { $regex: new RegExp(categoria, 'i') };
    }

    if (descripcion) {
      filter.descripcion = { $regex: new RegExp(descripcion, 'i') };
    }

    if (fecha) {
        const inicioDia = new Date(fecha);
        inicioDia.setUTCHours(0, 0, 0, 0); // 00:00:00.000

        const finDia = new Date(fecha);
        finDia.setUTCHours(23, 59, 59, 999); // 23:59:59.999

        // Busca cualquier evento que ocurra estrictamente dentro de ese día
        filter.fecha = {
          $gte: inicioDia,
          $lte: finDia
        };
    }

    const eventos = await Evento.find(filter).lean();
    return res.status(200).json(eventos);

  } catch (error) {
    console.error(error); 
    return res.status(500).json({ 
      ok: false, 
      message: "Error interno del servidor al obtener los eventos" 
    });
  }
};

/***********************************************************************************************************************/
const getEventoById = async (req, res, next) => {
  try {
        const v_idEvento         = req.params.idEvento; 
        console.log(v_idEvento);

        //Busca si el ID del evento existe
        const eventoFind = await Evento.findOne({_id:v_idEvento}); 
        const statusEvento = eventoFind.status;
        console.log(statusEvento)

        if(!eventoFind){
          return res.status(400).json({
            status:'error',
            message:'El evento no existe.'
          })        
        }

        const evento = await Evento.findOne({_id:v_idEvento}); 
        res.status(200).json(evento);
        next()
  } catch (error) {
    res.status(401).json({ ok:false, message: 'No se encontró el evento.'});
  }
};

/***********************************************************************************************************************/
const insEvento = async (req, res, next) => {
      //const {titulo,descripcion,categoria,fecha,ubicacion,capacidad,precio,v_status,artista} = req.body;

      const v_idEvento         = req.params.idEvento; 
      const v_titulo           = req.body.titulo;
      const v_descripcion      = req.body.descripcion;
      const v_categoria        = req.body.categoria;
      const v_fecha            = req.body.fecha;
      const v_ubicacion        = req.body.ubicacion;
      const v_capacidad        = req.body.capacidad;
      const v_precio           = req.body.precio;
      const v_status           = "draft";
      const v_organizador      = req.body.organizador;
      const v_artista          = req.body.artista;
            
      const vUUIDEvento = getUUID();
      const datosIngresados = {idEvento:vUUIDEvento,v_titulo,v_descripcion,v_categoria,v_fecha,v_ubicacion,v_capacidad,v_precio,v_artista};

      if(v_status!=='draft' && v_status!=='published' && v_status!=='cancelled' && v_status !== 'finished'){
            return res.status(400).json({
              status:'error',
              message:'El status ['+v_status+'] no está permitido.'
            })        
      }

      if(v_capacidad <= 0){
            return res.status(400).json({
              status:'error',
              message:'La capacidad no puede ser negativa o igual a cero.'
            })        
      }

      if(v_precio <= 0){
            return res.status(400).json({
              status:'error',
              message:'El precio no puede ser negativo o igual a cero.'
            })        
      }

      if(v_titulo == null){
            return res.status(400).json({
              status:'error',
              message:'El título del evento debe ser ingresado.'
            })         
      }

      if(v_descripcion == null){
            return res.status(400).json({
              status:'error',
              message:'La descripción del evento debe ser ingresado.'
            })         
      }

      if(v_categoria == null){
            return res.status(400).json({
              status:'error',
              message:'La categoria del evento debe ser ingresado.'
            })         
      }      

      if(v_fecha == null){
            return res.status(400).json({
              status:'error',
              message:'La fecha del evento debe ser ingresado.'
            })         
      } 

      if(v_ubicacion == null){
            return res.status(400).json({
              status:'error',
              message:'La ubicación del evento debe ser ingresado.'
            })         
      } 

      if(v_artista == null){
            return res.status(400).json({
              status:'error',
              message:'El artista del evento debe ser ingresado.'
            })         
      } 

      //Valida que la fecha del evento sea mayor a la actual y sea una fecha válida
      const dFecha = new Date(v_fecha);

      const dNow = new Date()
      if (dFecha <= dNow) {
          return res.status(400).json({
          status: 'error',
          message: 'La fecha del evento debe ser futura.'
      })
      }

      //Graba
      await Evento.create({idEvento:vUUIDEvento,titulo:v_titulo,descripcion:v_descripcion,categoria:v_categoria,fecha:v_fecha,ubicacion:v_ubicacion,capacidad:v_capacidad,precio:v_precio,artista:v_artista,organizador:req.user,status:v_status});
      res.status(201).json({
          status  : 'success',
          message : 'Evento registrado correctamente',
          datos   : datosIngresados
      })
      next();
};

/***********************************************************************************************************************/
const updEventoById = async (req, res, next) => { 
  try { 

    const v_IDevento = req.params.idEvento;

    //Valida que el ID del evento tenga un formato válido
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(v_IDevento)) {
    return res.status(400).json({ error: 'El ID ['+v_IDevento+'] del evento no es válido.' });
    }        

    //Valida que el evento exista
    const v_existeEvento = await Evento.findOne({ _id : v_IDevento }); 
    if (!v_existeEvento) {
        return res.status(404).json({
            status: 'error',
            message: 'El evento no existe.'
        });
    }

    //const v_idEvento         = req.params.idEvento; 
    const v_titulo           = req.body.titulo;
    const v_descripcion      = req.body.descripcion;
    const v_categoria        = req.body.categoria;
    const v_fecha            = req.body.fecha;
    const v_ubicacion        = req.body.ubicacion;
    const v_capacidad        = req.body.capacidad;
    const v_precio           = req.body.precio;
    const v_artista          = req.body.artista;

    if(v_titulo == null){
          return res.status(400).json({
            status:'error',
            message:'El título del evento debe ser ingresado.'
          })         
    }

    if(v_descripcion == null){
          return res.status(400).json({
            status:'error',
            message:'La descripción del evento debe ser ingresado.'
          })         
    }

    if(v_categoria == null){
          return res.status(400).json({
            status:'error',
            message:'La categoria del evento debe ser ingresado.'
          })         
    }      

    if(v_fecha == null){
          return res.status(400).json({
            status:'error',
            message:'La fecha del evento debe ser ingresado.'
          })         
    } 

    if(v_ubicacion == null){
          return res.status(400).json({
            status:'error',
            message:'La ubicación del evento debe ser ingresado.'
          })         
    } 

    if(v_capacidad <= 0){
          return res.status(400).json({
            status:'error',
            message:'La capacidad no puede ser negativa o igual a cero.'
          })        
    }

    if(v_precio <= 0){
          return res.status(400).json({
            status:'error',
            message:'El precio no puede ser negativo o igual a cero.'
          })        
    }

    if(v_artista == null){
          return res.status(400).json({
            status:'error',
            message:'El artista del evento debe ser ingresado.'
          })         
    } 

    //Valida que la fecha del evento sea mayor a la actual y sea una fecha válida
    const dFecha = new Date(v_fecha);

    const dNow = new Date()
    if (dFecha <= dNow) {
        return res.status(400).json({
        status: 'error',
        message: 'La fecha del evento debe ser futura.'
    })
    }
    
    //Busca el estado de un evento. Si está finished no se puede modificar
    const evento = await Evento.findOne({_id:v_IDevento}); 
    const statusEvento = evento.status;
    const organizadorEvento = evento.organizador;

    //Busca el rol de req.user en coleccion usuarios
    const usuario = await Usuario.findOne({email:req.user}); 
    const vRol_ReqUser = usuario.role;

    if(vRol_ReqUser!=='admin'){
          if(statusEvento==='finished'){
            return res.status(400).json({
              status:'error',
              message:'El evento está finished y no se pueden modificar sus datos.'
            })        
          }

          //Si el organizador del evento <> al req.user no permitir modificar
          if(organizadorEvento!==req.user){
            return res.status(400).json({
              status:'error',
              message:'El organizador del evento es distinto al usuario conectado y no se pueden modificar sus datos.'
            })       
          }
        }
    else{
          const resultado = await Evento.updateOne( 
            { _id: v_IDevento }, 
            { 
              $set: { 
                titulo: v_titulo,
                descripcion: v_descripcion,
                categoria: v_categoria,
                fecha: v_fecha,
                ubicacion: v_ubicacion,
                capacidad: v_capacidad,
                precio: v_precio,
                artista: v_artista
              } 
            } 
          ); 

          res.status(200).json({ 
            status: 'success', 
            message: 'Evento actualizado correctamente', 
            resultado 
          }); 
      }
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
};

/***********************************************************************************************************************/
const updEstadoEventoById = async (req, res, next) => { 
  try { 
    const v_idEvento         = req.params.idEvento; 
    const v_status           = req.body.status;

    //Valida que el ID del evento tenga un formato válido
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(v_idEvento)) {
    return res.status(400).json({ error: 'El ID ['+v_idEvento+'] del evento no es válido.' });
    }        

    //Valida que el evento exista
    const v_existeEvento = await Evento.findOne({ _id : v_idEvento }); 
    if (!v_existeEvento) {
        return res.status(404).json({
            status: 'error',
            message: 'El evento no existe.'
        });
    }

    //Busca el estado de un evento. No se puede cancelar un evento finished
    const evento = await Evento.findOne({ _id : v_idEvento }); 
    const statusEvento = evento.status;

    if(v_status===statusEvento){
      //El estado del evento es igual al estado de llamada a la API
      return res.status(400).json({
        status:'error',
        message:'No es necesario cambiar el estado del evento a ['+v_status+'] porque ya está en estado ['+statusEvento+']'
      })        
    }

    if(statusEvento==='finished' && v_status==='cancelled'){
      return res.status(400).json({
        status:'error',
        message:'No se puede cancelar un evento finalizado.'
      })        
    }

    if(statusEvento==='cancelled' && v_status==='finished'){
      return res.status(400).json({
        status:'error',
        message:'No se puede finalizar un evento cancelado.'
      })        
    }    

    if(statusEvento==='cancelled'){
      return res.status(400).json({
        status:'error',
        message:'Un evento cancelado no puede cambiar a estado '+v_status
      })        
    }    

    if(statusEvento==='finished'){
      return res.status(400).json({
        status:'error',
        message:'Un evento finalizado no puede cambiar a estado '+v_status
      })        
    }    

    if(statusEvento==='cancelled'){
      return res.status(400).json({
        status:'error',
        message:'No se puede cambiar el estado de un evento cancelado.'
      })        
    }

    //Actualiza estado evento
    const resultado = await Evento.updateOne( 
      { _id : v_idEvento }, 
      { 
        $set: { 
          status: v_status
        } 
      } 
    ); 
    res.status(200).json({ 
      status: 'success', 
      message: 'El Estado del Evento ha sido actualizado correctamente a '+v_status, 
      resultado 
    }); 

  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
};

/***********************************************************************************************************************/
const delEventoById = async (req, res, next) => { 
  try { 
    const v_idEvento         = req.params.idEvento; 
    const filtro = { _id: v_idEvento };

    //Valida que el ID del evento tenga un formato válido
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(v_idEvento)) {
    return res.status(400).json({ error: 'El ID ['+v_idEvento+'] del evento no es válido.' });
    }        
    
    //Valida que el evento exista
    const v_existeEvento = await Evento.findOne({ _id : v_idEvento }); 
    if (!v_existeEvento) {
        return res.status(404).json({
            status: 'error',
            message: 'El evento no existe.'
        });
    }

    //Valida que el evento este draft
    const v_Evento = await Evento.findOne({ _id : v_idEvento }); 
    const v_estadoEvento = v_Evento.status;
    if (v_estadoEvento !== 'draft') {
        return res.status(404).json({
            status: 'error',
            message: 'El evento debe estar en estado [draft] para ser eliminado. El evento está en estado : '+v_estadoEvento
        });
    }
    
    // Ejecutar la eliminación
    const resultado = await Evento.deleteOne(filtro);
    
    if (resultado.deletedCount === 1) {
      console.log('El evento fué eliminado con éxito.');
    } else {
      console.log('No se encontró ningún evento para borrar.');
    }
    
    res.status(200).json({ 
      status: 'success', 
      message: 'El evento fué eliminado con éxito.', 
      resultado 
    }); 
  } catch (error) { 
    res.status(500).json({ error: 'No se encontró ningún evento para borrar.' }); 
  } 
};

module.exports = { getEventos, insEvento, getEventoById, updEventoById, updEstadoEventoById, delEventoById};

