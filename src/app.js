const myConnection = require('express-myconnection');
const mysql=require('mysql');
const morgan = require('morgan');
const express = require('express');
const path = require('path');
const app=express();
//avisos
const session = require('express-session');
const flash = require('connect-flash');

// Configurar sesión
app.use(session({
    secret: 'tuSecreto',
    resave: false,
    saveUninitialized: true
}));
// Configurar connect-flash
app.use(flash());

// Middleware para pasar mensajes flash a todas las vistas
app.use((req, res, next) => {
    res.locals.successMessage = req.flash('successMessage');
    res.locals.errorMessage = req.flash('errorMessage');
    next();
});

//importando las rutas de customer
const customerRoutes=require('./routes/customer');

// configuraciones 
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");//vistas  
app.set("views", path.join(__dirname, "views")); //rutas de las vistas con path

// middleware, antes de las peticiones de los usuarios
app.use(morgan("dev")); 
//app.use(express.urlencoded({ extended: false }));
app.use(myConnection(mysql,{
    host:'localhost',
    user:'root',
    password:'',
    port:3306,
    database:'crudnode'
},'single'));
//middlewere para guardar
app.use(express.urlencoded({ extended: false }));



//routes
app.use('/', customerRoutes);

// archivos estaticos imagenes,stilos framework 
app.use(express.static(path.join(__dirname, "public")));



app.listen(3000,()=>{
    console.log("servidor arriba y funcionando")
})
