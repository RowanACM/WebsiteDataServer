
"use strict";
module.exports = state => {

    const announcementRoutes = require('express-promise-router')();

    let db = state.db;

    announcementRoutes.post('/editAccount', (req, res) => {

        let token = req.body["idToken"];
        if (!token) {
            res.status(400).send();
            console.log("Rejected user edit (400) - no token supplied");
            return;
        }

        state.getPayload(token).then(payload => {

            db.get(`select sub, expires from users where sub='${payload.sub}'`, [], (err, row) => {

                if (row && new Date().getTime() < row["expires"]) {

                    let name = req.body["name"];
                    let desc = req.body["desc"];

                    if (!name || !desc) {
                        console.log("Rejected user edit (400) - bad inputs");
                        res.status(400).send();
                    } else {

                        let values = [name, desc, row["sub"]];

                        db.run("update users set name=?, desc=? where sub=?", values, err => {
                            if (err) {
                                console.log(err);
                                res.status(500).send();
                            } else {
                                res.status(200).send();
                                console.log("User edited (200) - " + name);
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
