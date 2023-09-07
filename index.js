const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express')
const app = express()
const port = 3000
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require('uuid');
const { log } = require('console');

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, 'public')));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'put_your'
});

let getRandomUser = () => {
    return [
        faker.datatype.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
    ];
}

//Home Route
app.get('/', (req, res) => {
    let q = `select count(*) FROM USER`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let count = result[0]["count(*)"];
            res.render("home.ejs", {count});
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }
});

//Show route
app.get('/user', (req, res) => {
    let q = `SELECT * FROM user`;
    try {
        connection.query(q, (err, users) => {
            if (err) throw err;
            res.render("showuser.ejs",{users});
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }
});


//Edit Route
app.get('/user/:id/edit', (req, res) => {
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            res.render("edit.ejs", {user});
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }
});


//Update (DB) route
app.patch('/user/:id', (req, res) => {
    let {id} = req.params;
    let {password: formPass, username: newUsername} = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            if (formPass != user.password) {
                res.send("Wrong password");
            } else {
                let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
                connection.query(q2, (err, result) => {
                    if(err) throw err;
                     res.redirect('/user');
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }
});

//Add user
app.get('/user/add', (req, res) => {
    res.render("add.ejs")
});

app.post('/user/added', (req, res) => {
    const { username, email, password } = req.body;
    let id = uuidv4();
    const q = `INSERT INTO user ( id, username, email, password) VALUES (?, ?, ?, ?)`;

    connection.query(q, [ id, username, email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal server error");
        }
        res.redirect('/user'); 
    });
});


//Delte user
app.get('/user/:id/delete', (req, res) => {
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            res.render("delete.ejs", {user});
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }
});


app.delete('/user/:id', (req, res) => {
    let { id } = req.params;
    let { password: formPass, email: newEmail } = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) {
                console.error(err);
                res.send("Some error in DB");
                return;
            }
            let user = result[0];
            if (formPass !== user.password || newEmail !== user.email) {
                res.send("Wrong password or email");
            } else {
                let q2 = `DELETE FROM user WHERE id='${id}'`;
                connection.query(q2, (err, result) => {
                    if (err) {
                        console.error(err);
                        res.send("Some error in DB");
                        return;
                    }
                    res.redirect('/user');
                });
            }
        });
    } catch (err) {
        console.error(err);
        res.send("Some error occurred");
    }
});




app.listen(port, () => {
    console.log(`app listening on port ${port}!`)
});



