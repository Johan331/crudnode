const express = require('express');
const router = express.Router();

// Importar correctamente el controlador
const customerController = require('../controllers/customerController');

// Middleware para autenticar rutas protegidas
function isAuthenticated(req, res, next) {
    const publicPaths = ['/login', '/register', '/logout'];
    if (publicPaths.includes(req.path)) {
        return next();
    }

    if (req.session && req.session.user) {
        return next();
    }

    res.redirect('/login');
}

// Rutas públicas
router.get('/register', customerController.register); // Mostrar formulario de registro
router.post('/register', customerController.registerUser); // Manejar registro de usuario

router.get('/login', customerController.login); // Mostrar formulario de login
router.post('/login', customerController.loginUser); // Manejar login de usuario

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        }
        res.redirect('/login');
    });
});

// Middleware para rutas protegidas
router.use(isAuthenticated);

// Rutas protegidas
router.get('/list', customerController.list); // Listar clientes
router.post('/add', customerController.save); // Guardar cliente
router.get('/delete/:id', customerController.delete); // Eliminar cliente
router.get('/update/:id', customerController.edit); // Mostrar formulario de edición
router.post('/update/:id', customerController.update); // Actualizar cliente

module.exports = router;
