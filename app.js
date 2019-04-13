const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3");

const app = express();
const state = {};

state.db = new sqlite3.Database("./db/acm.db", err => {
    console.log("Connected to database");
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const announcementRoutes = require('./routes/announcements');
const addAnnouncementRoutes = require("./routes/addAnnouncement");
app.use('/', announcementRoutes(state));
app.use("/", addAnnouncementRoutes(state));

const PORT = 5000;
app.listen(PORT,()=> {
    console.log("server started on port: " + PORT);
});
