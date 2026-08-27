const { getUUID } = require('../utils/getUUID');

const Ticket  = require('../models/ticket.model');
const Usuario = require('../models/usuario.model');
const Evento  = require('../models/evento.model');

const bcryptjs = require('bcrypt');
const saltRounds = 5;
const jwt = require('jsonwebtoken');
require('dotenv').config();

/***********************************************************************************************************************/
const getTicket = async (req, res, next) => {
  try {
    const tickets = await Ticket.find(); 
    res.status(200).json(tickets);
    next()
  } catch (error) {
    res.status(401).json({ ok:false, message: "Invalid TOKEN"});
  }
};

/***********************************************************************************************************************/
const insTicket = async (req, res, next) => {
    try {

        const v_IDevento = req.body.evento;
        const v_cantidad = req.body.cantidad;

        const isNumeric = /^[+-]?\d+(\.\d+)?$/.test(v_cantidad)

        // Validar que la cantidad sea numérica
        if (!isNumeric) {
            return res.status(400).json({
                status: 'error',
                message: 'La cantidad no es numérica.'
            });
        }

        // Validar cantidad primero para ahorrar consultas a la base de datos
        if (v_cantidad <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'La cantidad de ticket no puede ser 0 o menor.'
            });
        }

        // Obtiene usuario de req.user
        const usuario = await Usuario.findOne({ email: req.user }); 

        // Validar si el usuario exista en la BD
        if (!usuario) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado.'
            });
        }

        const _idUser = usuario._id;

        let v_UUIDTicket     = getUUID();
        let v_estado         = 'active';
        let v_codigo_reserva = getUUID();
        let d_fecha_creacion = new Date();

        const datosIngresados = {
            idTicket       : v_UUIDTicket, 
            user           : _idUser, 
            evento         : v_IDevento,
            estado         : v_estado, 
            cantidad       : v_cantidad, 
            codigo_reserva : v_codigo_reserva, 
            fecha_creacion : d_fecha_creacion
        };

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

        //Valida que el evento este PUBLISHED
        const v_Evento = await Evento.findOne({ _id : v_IDevento }); 
        const v_estadoEvento = v_Evento.status;
        if (v_estadoEvento !== 'published') {
            return res.status(404).json({
                status: 'error',
                message: 'El evento debe estar en estado [published] para vender tickets. El evento está en estado : '+v_estadoEvento
            });
        }

        //Valida que el usuario no tenga otro ticket
        /*
        const v_TicketUsuario = await Ticket.findOne({ user : _idUser }); 
        if (v_TicketUsuario) {
            return res.status(404).json({
                status: 'error',
                message: 'Ya existe un ticket para el usuario'
            });
        }
        */

        //Valida que el evento tenga capacidad > 0
        const v_EventoCapacidad = await Evento.findOne({ _id : v_IDevento }); 
        const n_EventoCapacidad = v_EventoCapacidad.capacidad;

        if(n_EventoCapacidad===0){
            return res.status(404).json({
                status: 'error',
                message: 'La capacidad del evento es 0 y no se pueden crear tickets'
            });             
        }

        //Valida que la [cantidad solicitada] <= [EVENTO.capacidad - TICKET.cantidad {estado=active}]
        const v_EventoSolicitado = await Evento.findOne({ _id : v_IDevento }); 
        const n_cantidad_Solicitada = req.body.cantidad;
        const n_cantidad_Evento = v_EventoSolicitado.capacidad;
        const n_totalCantidad = await Ticket.aggregate([
            { $match: { estado: 'active' } },
            { $group: {
                        _id: null, // Agrupa todos los documentos juntos
                        total: { $sum: "$cantidad" } // Suma el campo cantidad
                      }}
        ]);    
        const n_sumaTotal = n_totalCantidad.length > 0 ? n_totalCantidad[0].total : 0;

        if(Number(n_cantidad_Evento) < Number(n_sumaTotal) + Number(n_cantidad_Solicitada)){
            return res.status(404).json({
                status: 'error',
                message: 'Ya no hay más cupos disponibles para el evento. Cantidad evento:'+n_cantidad_Evento+', Cantidad vendida:'+n_sumaTotal+', cantidad solicitada:'+n_cantidad_Solicitada
            });             
        }

        //Validar que la fecha de compra del ticket sea anterior a la fecha del evento
        let d_fecha_ticket = new Date();
        const d_fechaEvento  = v_Evento.fecha;

        if (d_fecha_ticket > d_fechaEvento) {
            return res.status(404).json({
                status: 'error',
                message: 'La fecha del ticket es mayor a la fecha del evento y no se puede comprar un ticket.'
            });            
        }        

        // Graba en la base de datos usando _idUser
        await Ticket.create({ 
            idTicket       : v_UUIDTicket,
            user           : _idUser, //  Corregido de v_user a _idUser
            evento         : v_IDevento,
            estado         : v_estado, 
            cantidad       : v_cantidad, 
            codigo_reserva : v_codigo_reserva, 
            fecha_creacion : d_fecha_creacion
        });

        // Envía la respuesta (No uses next() después de esto)
        return res.status(201).json({
            status  : 'success',
            message : 'Ticket registrado correctamente',
            datos   : datosIngresados
        });

    } catch (error) {
        // En caso de error inesperado, pasa el control al manejador global de Express
        next(error); 
    }
};

/***********************************************************************************************************************/
/***********************************************************************************************************************/
const cancelarTicket = async (req, res, next) => {
    try {
        const v_idTicket = req.params._id; 

        //Valida que el ticket exista
        const v_existeTicket = await Ticket.findOne({ _id : v_idTicket }); 
        if (!v_existeTicket) {
            return res.status(404).json({
                status: 'error',
                message: 'El Ticket no existe.'
            });
        }

        //Valida que el evento no haya finalizado o cancelado
        const v_idEvento     = v_existeTicket.evento;
        const v_EstadoEvento = await Evento.findOne({ _id : v_idEvento }); 
        if (v_EstadoEvento.status === 'finished' || v_EstadoEvento.status === 'cancelled') {
            return res.status(404).json({
                status: 'error',
                message: 'El Ticket no puede ser cancelado porque el evento está : ['+v_EstadoEvento.status+']'
            });
        }        
        
        //Valida que el Ticket este [active]
        const v_Ticket = await Ticket.findOne({ _id : v_idTicket }); 
        const v_estadoTicket = v_Ticket.status;
        if (v_estadoTicket !== 'active') {
            return res.status(404).json({
                status: 'error',
                message: 'El Ticket debe estar en estado [active] para ser cancelado. El ticket está en estado : '+v_estadoTicket
            });
        }    
        
        //Marca Ticket como cancelled
        const resultado = await Ticket.updateOne( 
        { _id : v_idTicket }, 
        { 
            $set: { 
            estado: 'cancelled'
            } 
        } 
        ); 

    } catch (error) {
        // En caso de error inesperado, pasa el control al manejador global de Express
        next(error); 
    }
};

/***********************************************************************************************************************/
/***********************************************************************************************************************/
const updEstadoTicketById = async (req, res, next) => {
    try {
        const v_idTicket  = req.params._id; 
        const v_newEstado = req.body.newEstado;

        if(v_newEstado !== 'active' && v_newEstado !== 'cancelled'){
            return res.status(404).json({
                status: 'error',
                message: 'El nuevo estado debe ser [active] o [cancelled]. El estado enviado es : ['+v_newEstado+']'
            });
        }

        //Valida que el estado actual y el nuevo sean distintos
        const vTicket = await Ticket.findOne({ _id : v_idTicket }); 
        const vEstadoActual = vTicket.estado;
        if(vEstadoActual === v_newEstado){
            return res.status(404).json({
                status: 'error',
                message: 'El estado actual del Ticket y el nuevo estado son iguales.'
            });
        }

        //Valida que el ticket exista
        const v_existeTicket = await Ticket.findOne({ _id : v_idTicket }); 
        if (!v_existeTicket) {
            return res.status(404).json({
                status: 'error',
                message: 'El Ticket no existe.'
            });
        }

        //Cambiar estado del ticket
        const resultado = await Ticket.updateOne( 
        { _id : v_idTicket }, 
        { 
            $set: { 
            estado: v_newEstado
            } 
        } 
        ); 
        res.status(200).json({ 
        status: 'success', 
        message: 'El Estado del Ticket ha sido actualizado correctamente a '+v_newEstado
        }); 

    }catch (error) {
        // En caso de error inesperado, pasa el control al manejador global de Express
        next(error); 
    }
};

/***********************************************************************************************************************/
const misTickets = async (req, res, next) => {
  try {

    const usuario = await Usuario.findOne({ email: req.user }); 
    const _idUsuario = usuario._id;

    const tickets = await Ticket.find({user:_idUsuario}); 
    res.status(200).json(tickets);
    next()
  } catch (error) {
    res.status(401).json({ ok:false, message: "Invalid TOKEN"});
  }
};

module.exports = { getTicket, insTicket, cancelarTicket, updEstadoTicketById, misTickets};

