
"use strict";
module.exports = states => {

    const announcementRoutes = require('express-promise-router')();

    let db = states.db;

    let sql = "SELECT * FROM committees";

    announcementRoutes.get('/committeeList', (req, res) => {
        db.all(sql, [], (err, rows) => {
            res.status(200).send(rows)
        });
    });

    return announcementRoutes;

};
