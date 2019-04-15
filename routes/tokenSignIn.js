
"use strict";

const age = 1000 * 5 * 60; // Five minutes in ms before user session expires

module.exports = state => {

    const announcementRoutes = require('express-promise-router')();

    let db = state.db;

    announcementRoutes.post('/tokensignin', (req, res) => {

        let token = req.body["idToken"];
        if (!token) {
            res.status(400).send();
            console.log("Rejected sign in (400) - no token supplied");
            return;
        }

        state.getPayload(token).then(payload => {

            if (payload.aud !== state.CLIENT_ID || !(payload.iss === "accounts.google.com" || payload.iss === "https://accounts.google.com")) {
                res.status(403).send(); // User token seems fishy - isn't issued by google or doesn't match our website
                console.log("Rejected sign in (403) - suspicious user token");
                return;
            }

            if (!payload.hd || !payload.hd.endsWith("rowan.edu")) {
                res.status(403).send(); // Not a Rowan email address
                console.log("Rejected sign in (403) - not a Rowan email address");
                return;
            }

            if (!payload.email_verified) {
                res.status(403).send(); // User's email isn't verified by Google TODO: Verify it ourselves
                console.log("Rejected sign in (403) - unverified email");
                return;
            }

            let name = payload.name;
            let picture = payload.picture; // TODO: Use this
            let email = payload.email;
            let sub = payload.sub; // User ID. Don't use email as ID since it may change

            db.get(`select * from users where sub='${sub}'`, [], (err, row) => {

                let date = new Date(new Date().getTime() + age).getTime();

                if (row) { // User exists

                    if (req.body["verify"]) { // User is verifying that they are signed in
                        db.get(`select isAdmin, expires from users where sub='${sub}'`, [], (err, row) => {

                            if (row) {
                                if (new Date().getTime() < row["expires"]) {

                                    res.status(200).send(JSON.stringify({
                                        signedIn: true,
                                        isAdmin: row["isAdmin"]
                                    }));

                                } else { // TODO: clean this mess up

                                    res.status(200).send(JSON.stringify({
                                        signedIn: false,
                                    }));

                                }
                            } else {
                                res.status(200).send(JSON.stringify({
                                    signedIn: false,
                                }));
                                console.log("sub: " + sub + " token: " + token);
                            }

                        });
                        return;
                    }

                    db.run(`update users set expires=${date} where sub='${sub}'`);

                    res.status(200).send(JSON.stringify({
                        expires: date,
                        idAdmin: row["isAdmin"]
                    }));
                    console.log("User signed in (200) " + email + (row["isAdmin"] ? "(Admin)" : ""));

                } else { // Create user

                    db.run(`insert into users (sub, name, picture, email, isAdmin, expires) values ('${sub}', '${name}', '${picture}', '${email}', 0, ${date});`);
                    res.status(200).send(JSON.stringify({
                        // name: name,
                        // email: email,
                        expires: date,
                        isAdmin: 0 //row.isAdmin
                    }));

                    console.log("Created user (200) " + email);

                }

            });

        });

    });

    return announcementRoutes;

};
