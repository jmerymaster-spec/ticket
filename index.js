const express = require('express');
const app = express();
const mongoose = require('mongoose');
const usuarioRoutes = require('./routes/usuarioRoutes');
const eventoRoutes  = require('./routes/eventoRoutes');
const ticketRoutes  = require('./routes/ticketRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
mongoose.connect('mongodb://localhost:27017/mi_base_datos')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.log(err));
*/

mongoose.connect('mongodb://localhost:27017/mi_base_datos')
  .catch(err => console.log(err));

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/eventos' , eventoRoutes);
app.use('/api/tickets' , ticketRoutes);

app.listen(3000, () => {
  console.log('Servidor en puerto 3000');
});