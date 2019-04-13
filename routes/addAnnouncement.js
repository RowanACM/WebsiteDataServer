
"use strict";
module.exports = states => {

    const announcementRoutes = require('express-promise-router')();

    let db = states.db;

    announcementRoutes.get('/addAnnouncement', (req, res) => {

        db.get(`select 1 from tokens where token='${req.query["token"]}'`, [], (err, row) => {

            if (row) {

                let id = req.query["id"];
                let announcement = req.query["announcement"];

                if (!id || !announcement) {
                    res.status(400).send();
                } else {

                    let values = [id, announcement];

                    db.run("insert into announcements (id, announcement) values (?, ?)", values, err => {
                        if (err) {
                            console.log(err);
                            res.status(500).send();
                        } else {
                            res.status(200).send();
                        }
                    });
                }

            } else {
                res.status(403).send();
            }

        });

    });

    return announcementRoutes;

};
