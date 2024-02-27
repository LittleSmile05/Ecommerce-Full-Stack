const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 3000;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'ECOMMERCE')));

app.use(express.static(__dirname));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await pool.query('SELECT * FROM myusers WHERE username = $1', [username]);

        if (existingUser.rows.length > 0) {
            console.log('Username already taken');
            res.status(400).send('Username already taken');
            return;
        }

        if (password.length < 5) {
            console.log('Password must be at least 5 characters long');
            res.status(400).send('Password must be at least 5 characters long');
            return;
        }

        await pool.query('INSERT INTO myusers (username, password) VALUES ($1, $2)', [username, password]);
        console.log('User registered successfully');

        res.redirect('/signin.html');

    } catch (error) {
        console.error('Error registering user', error);
        res.status(500).send('Error registering user');
    }
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, '/ECOMMERCE/signin.html'));
});

app.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM myusers WHERE username = $1 AND password = $2', [username, password]);

        if (result.rows.length > 0) {
            console.log('User signed in successfully');
            res.sendFile(path.join(__dirname, './main.html'));
        } else {
            console.log('Invalid username or password');
            res.sendFile(path.join(__dirname, 'error.html'));
        }
    } catch (error) {
        console.error('Error signing in', error);
        res.status(500).send('Error signing in');
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
