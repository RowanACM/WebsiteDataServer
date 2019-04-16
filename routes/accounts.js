
"use strict";
module.exports = states => {

    const announcementRoutes = require('express-promise-router')();

    let db = states.db;

    let sql = "select name, picture, email, desc from users";

    announcementRoutes.get('/accountList', (req, res) => {
        db.all(sql, [], (err, rows) => {
            res.status(200).send(rows)
        });
    });

    return announcementRoutes;

};
