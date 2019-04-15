
"use strict";
module.exports = state => {

    const announcementRoutes = require('express-promise-router')();

    let db = state.db;

    announcementRoutes.post('/addAnnouncement', (req, res) => {

        let token = req.body["idToken"];
        if (!token) {
            res.status(400).send();
            console.log("Rejected announcement (400) - no token supplied");
            return;
        }

        state.getPayload(token).then(payload => {

            db.get(`select expires from users where sub='${payload.sub}' and isAdmin=1`, [], (err, row) => {

                if (row && new Date().getTime() < row["expires"]) {

                    let id = req.body["id"];
                    let announcement = req.body["announcement"];

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
                                console.log("Announcement posted (200) - " + JSON.parse(announcement).title);
                            }
                        });
                    }

                } else {
                    res.status(403).send();
                }

            });

        });

    });

    return announcementRoutes;

};
