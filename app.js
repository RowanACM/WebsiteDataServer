const CLIENT_ID = "587958545142-eeai3n1svhpndn1jvgfrsomd1djhcag5.apps.googleusercontent.com";

const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3");
const {OAuth2Client} = require("google-auth-library");

const app = express();
const state = {};

const client = new OAuth2Client(CLIENT_ID);

async function getPayload(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    return ticket.getPayload();
}

state.getPayload = getPayload;
state.CLIENT_ID = CLIENT_ID;

state.db = new sqlite3.Database("./db/acm.db", err => {
    console.log("Connected to database");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const announcementRoutes = require('./routes/announcements');
const addAnnouncementRoutes = require("./routes/addAnnouncement");
const tokenSignIn = require("./routes/tokenSignIn");
const accounts = require("./routes/accounts");
app.use('/', announcementRoutes(state));
app.use("/", addAnnouncementRoutes(state));
app.use("/", tokenSignIn(state));
app.use("/", accounts(state));

const PORT = 5000;
app.listen(PORT,()=> {
    console.log("server started on port: " + PORT);
});
