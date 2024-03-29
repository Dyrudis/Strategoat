const express = require("express");
const session = require("express-session")({
    // strategoat en Sha256
    secret: "6167eb9b9859b49739572ec07a4fba131bc08a10ddae66654399557df0dc1134",
    resave: true,
    reset: true,
    saveUninitialized: true
});
const sharedSession = require("express-socket.io-session");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const sha256 = require('hash.js/lib/hash/sha/256');
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const connection = mysql.createConnection({
    // Connexion à une base de donnée locale :
    host: "localhost",
    user: "root",
    password: "",
    database: "strategoat"
});

app.use('/favicon.ico', express.static(`${__dirname}/front/ressources/image/icon.png`));

app.use(session);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/front/`));
io.use(sharedSession(session, {
    autoSave: true
}));

const games = require("./back/modules/game");
const connections = require("./back/modules/connection");

require("./back/modules/socket")(io, games, connection, connections);

// Arrivée sur l'accueil
app.get("/", (req, res) => {
    // res.sendFile(`${__dirname}/front/html/game.html`);
    if (req.session.username && req.session.game) {
        // Utilisateur connecté et dans une partie, on l'envoie vers la page de partie
        res.sendFile(`${__dirname}/front/html/game.html`);
    }
    else if (req.session.username) {
        // Utilisateur connecté, on l'envoie vers la page d'accueil
        res.sendFile(`${__dirname}/front/html/index.html`);
    } else {
        // Utilisateur non connecté, on l'envoie vers la page de connexion
        res.sendFile(`${__dirname}/front/html/login.html`);
    }
});

// Connexion à un compte existant
app.post("/signin", (req, res) => {
    if (req.session.username == undefined) {
        const username = req.body.username;
        const password = sha256().update(req.body.password).digest('hex');
        if (username && password) {
            connection.query("SELECT * FROM accounts WHERE BINARY username = ? AND BINARY password = ?", [username, password], (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                    req.session.username = username;
                    req.session.gamePlayed = result[0].gamePlayed;
                    req.session.gameWon = result[0].gameWon;
                    req.session.elo = result[0].elo;
                    res.redirect("/");
                }
                else {
                    res.send("Nom d'utilisateur ou un mot de passe incorrect.");
                }
            });
        }
        else {
            res.send("Merci de renseigner un nom d'utilisateur ou un mot de passe.");
        }
    }
    else {
        res.send("Vous êtes déjà connecté.");
    }
});

// Création d'un nouveau compte
app.post("/signup", (req, res) => {
    const username = req.body.username;
    const password = sha256().update(req.body.password).digest('hex');
    const email = req.body.email;
    if (username && password) {
        connection.query("SELECT * FROM accounts WHERE username = ?", [username], (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.send("Nom d'utilisateur déjà enregistré.");
            }
            else {
                const info = {
                    username: username,
                    password: password,
                    email: email
                }
                connection.query("INSERT INTO accounts SET ?", [info], (err, result) => {
                    if (err) throw err;
                });
                connections.newPlayer(username);
                req.session.username = username;
                res.redirect("/");
            }
        });
    }
    else {
        res.send("Merci de renseigner un nom d'utilisateur ou un mot de passe.");
    }
});

// Déconnexion du compte
app.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

// Au lancement du serveur on récupère les informations des comptes déjà existants
connection.query("SELECT username FROM accounts", (err, result) => {
    if (err) throw err;
    connections.init(result);
});

const port = process.env.PORT || 4200;

http.listen(port, () => {
    console.log(`Serveur lancé sur : http://localhost:${port}`);
});