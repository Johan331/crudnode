const controller = {}; // Se crea el objeto
const bcrypt = require('bcrypt');

// Listar clientes
controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM customer', (err, customers) => {
            if (err) {
                res.json(err);
            }
            res.render('customers', {
                data: customers || [],
            });
        });
    });
};

// Mostrar formulario de login
controller.login = (req, res) => {
    res.render('login');
};

// Iniciar sesión
controller.loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).render('login', { errorMessage: 'Por favor, complete todos los campos.' });
    }

    req.getConnection((err, conn) => {
        if (err) return res.status(500).render('login', { errorMessage: 'Error de conexión con la base de datos.' });

        conn.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).render('login', { errorMessage: 'Error al buscar el usuario.' });
            if (results.length === 0) {
                return res.status(401).render('login', { errorMessage: 'Usuario o contraseña incorrectos.' });
            }

            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).render('login', { errorMessage: 'Contraseña incorrecta.' });
            }

            req.session.user = { id: user.id, email: user.email };
            res.redirect('/list'); // Redirige a la lista
        });
    });
};

// Mostrar formulario de registro
controller.register = (req, res) => {
    res.render('register');
};

// Registrar usuario
controller.registerUser = (req, res) => {
    const { email, password, password_confirm } = req.body;

    // Validaciones del servidor
    if (!email || !password || !password_confirm) {
        return res.status(400).render('register', { errorMessage: 'Todos los campos son obligatorios.' });
    }

    if (password !== password_confirm) {
        return res.status(400).render('register', { errorMessage: 'Las contraseñas no coinciden.' });
    }

    // Validar seguridad de la contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // Al menos 8 caracteres, una mayúscula y un número
    if (!passwordRegex.test(password)) {
        return res.status(400).render('register', {
            errorMessage: 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número.',
        });
    }

    req.getConnection((err, conn) => {
        if (err) return res.status(500).render('register', { errorMessage: 'Error al conectarse a la base de datos.' });

        conn.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).render('register', { errorMessage: 'Error al verificar el correo.' });
            if (results.length > 0) {
                return res.status(400).render('register', { errorMessage: 'El correo ya está registrado.' });
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                conn.query('INSERT INTO users (email, password, register_date) VALUES (?, ?, NOW())', [email, hashedPassword], (err, result) => {
                    if (err) return res.status(500).render('register', { errorMessage: 'Error al registrar el usuario.' });

                    req.session.user = { id: result.insertId, email };

                    res.redirect('/list');
                });
            } catch (error) {
                res.status(500).render('register', { errorMessage: 'Error al procesar la contraseña.' });
            }
        });
    });
};

// Guardar un cliente
controller.save = (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ errorMessage: 'Todos los campos son obligatorios.' });
    }

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ errorMessage: 'Error al conectarse a la base de datos.' });

        conn.query('INSERT INTO customer (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], (err) => {
            if (err) return res.status(500).json({ errorMessage: 'Error al guardar el cliente.' });

            res.redirect('/list');
        });
    });
};

// Eliminar un cliente
controller.delete = (req, res) => {
    const { id } = req.params;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ errorMessage: 'Error al conectarse a la base de datos.' });

        conn.query('DELETE FROM customer WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).json({ errorMessage: 'Error al eliminar el cliente.' });

            res.redirect('/list');
        });
    });
};

// Mostrar datos de un cliente para editar
controller.edit = (req, res) => {
    const { id } = req.params;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ errorMessage: 'Error al conectarse a la base de datos.' });

        conn.query('SELECT * FROM customer WHERE id = ?', [id], (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).json({ errorMessage: 'Cliente no encontrado.' });
            }

            res.render('edit', { data: results[0] });
        });
    });
};

// Actualizar un cliente
controller.update = (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ errorMessage: 'Todos los campos son obligatorios.' });
    }

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ errorMessage: 'Error al conectarse a la base de datos.' });

        conn.query('UPDATE customer SET name = ?, email = ?, phone = ? WHERE id = ?', [name, email, phone, id], (err) => {
            if (err) return res.status(500).json({ errorMessage: 'Error al actualizar el cliente.' });

            res.redirect('/list');
        });
    });
};

module.exports = controller;
