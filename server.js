const express = require("express");
const crypto = require("crypto");

const tableName = "your_table_name";
const sessionSecret = crypto.randomBytes(32).toString("hex");

const mysql = require("mysql2");
const app = express();

const session = require("express-session");
const port = 3000;

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "your_password",
	database: "your_database_name",
});

connection.connect((err) => {
	if(err) throw err;
});

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));

app.use(session({
	secret: sessionSecret,
	resave: true,
	saveUninitialized: true,
}));

app.get("/", (req, res) => {
	if(req.session.user) {
		const {user_phone_number} = req.session.user;
		
		res.send(`${user_phone_number}<a href="/logout" style="text-decoration: none; color: dodgerblue; float: right; font-weight: bold;">SignOut</a>`);
	}
	else res.redirect("/login");
});

app.get("/signup", (req, res) => {
	res.render("signup");
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if(err) throw err;
		else res.redirect("/login");
	});
});

app.post("/signup", (req, res) => {
	const {user_phone_number, user_password} = req.body;
	
	const sql = `insert into ${tableName} (user_phone_number, user_password) values(?, ?)`;
	
	connection.query(sql, [user_phone_number, user_password], (err, result) => {
		if(err) throw err;
		else res.redirect("/login");
	});
});

app.post("/login", (req, res) => {
	const {user_phone_number, user_password} = req.body;
	
	const sql = `select * from ${tableName} where user_phone_number = ? and user_password = ?`;
	
	connection.query(sql, [user_phone_number, user_password], (err, results) => {
		if(err) throw err;
		if(results.length > 0) {
			req.session.user = results[0];
			res.redirect("/");
		}
		else res.send(`Incorrect phone number or password. Please try again. <a style="text-decoration: none; color: dodgerblue; font-weight: bold;" href="/login">LogIn</a>`);
	});
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});