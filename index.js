const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const {
  Client
} = require('pg');
const {
  Pool
} = require('pg');


// Initialise postgres client
const client = new Client({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'pokemons',
  port: 5432,
});

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'pokemons',
  port: 5432,
});
/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride('_method'));


// Set handlebars to be the default view engine
app.engine('handlebars', exphbs.create().engine);
app.set('view engine', 'handlebars');

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
});

/**
 * ===================================
 * Routes
 * ===================================
 */

//go to home page
function goToHome(request, response) {
  //connect to db
  pool.connect((err, client, done) => {
    //error logs
    if (err) console.error(err);
    // your queries go here
    let queryString = "SELECT * FROM pokemon";
    // your dynamic values go here (i.e what does $1 $2 $3 represent. use the obj returned from readFile)
    let values = [];
    //send the query to the database
    client.query(queryString, values, (err2, res) => {
      done();
      if (err2) {
        //if error, send msg
        console.log('query error', err2.message);
      } else {
        //else show the result of the first row
        console.log('result', res.rows[0]);
        //write the context based on the result of the sql query
        let context = {
          pokemon: res.rows,
        };
        //render the home.handlebars with the context stated.
        response.render("home", context);
      };
    });
  });
};

function showPokemonByPriId(request, response) {
  pool.connect((err, client, done) => {
    //error logs
    if (err) console.error(err);
    // your queries go here
    //get query string based on the request.params.id
    let queryString = "SELECT * FROM pokemon WHERE id = " + request.params.id;
    // your dynamic values go here (i.e what does $1 $2 $3 represent. use the obj returned from readFile)
    let values = [];
    //send the query to the database
    client.query(queryString, values, (err2, res) => {
      done();
      if (err2) {
        //if error, send msg
        console.log('query error', err2.message);
      } else {
        //write the context based on the result of the sql query
        let context = {
          pokemon: res.rows[0],
        };
        //render the home.handlebars with the context stated.
        response.render("pokemon", context);
      };
    });
  });
};



function goToCreationForm(request, response) {
  //respond with a rendering of form.handlebars
  response.render("new");
};

function newPokemonEntry(request, response) {
  //request.body refers to the form data submitted
  pool.connect((err, client, done) => {
    //error logs
    if (err) console.error(err);
    // your queries go here
    //get query string based on the form data submitted
    let queryString = "INSERT INTO pokemon (num, name, img, weight, height) VALUES ($1, $2, $3, $4, $5)";
    // your dynamic values go here (i.e what does $1 $2 $3 represent. use the obj returned from readFile)
    let values = [request.body.num, request.body.name, request.body.img, request.body.weight, request.body.height];

    client.query(queryString, values, (err2, res) => {
      done();
      if (err2) {
        //if error, send msg
        console.log('query error', err2.message);
      } else {
        response.redirect("/");
      };
    });
  });
};

function editById(request, response) {
  pool.connect((err, client, done) => {
    //error logs
    if (err) console.error(err);
    // your queries go here
    //get query string based on the request.params.id
    let queryString = "SELECT * FROM pokemon WHERE id = " + request.params.id;
    // your dynamic values go here (i.e what does $1 $2 $3 represent. use the obj returned from readFile)
    let values = [];
    client.query(queryString, values, (err2, res) => {
      done();
      if (err2) {
        //if error, send msg
        console.log('query error', err2.message);
      } else {
        //write the context based on the result of the sql query
        let context = {
          pokemon: res.rows[0],
        };
        //render the home.handlebars with the context stated.
        response.render("edit", context);
      };
    });
  });
};

function saveEdits(request, response) {
  pool.connect((err, client, done) => {
    //error logs
    if (err) console.error(err);
    // your queries go here
    //get query string based on the request.params.id and insert into it
    let queryString = "UPDATE pokemon SET num = $1, name = $2, img = $3, weight = $4, height = $5 WHERE id = " + request.params.id;
    // your dynamic values go here (i.e what does $1 $2 $3 represent. use the obj returned from readFile)
    let values = [request.body.num, request.body.name, request.body.img, request.body.weight, request.body.height];
    client.query(queryString, values, (err2, res) => {
      done();
      if (err2) {
        //if error, send msg
        console.log('query error', err2.message);
      } else {
        //redirect to home page
        response.redirect("/" + request.params.id);
      };
    });
  });
};

function deletePokemonById(request, response) {
  pool.connect((err, client, done) => {
    //error logs
    if (err) console.error(err);
    // your queries go here
    //get query string based on the request.params.id and delete it
    let queryString = "DELETE from pokemon WHERE id = " + request.params.id;
    // your dynamic values go here (i.e what does $1 $2 $3 represent. use the obj returned from readFile)
    let values = [];
    client.query(queryString, values, (err2, res) => {
      done();
      if (err2) {
        //if error, send msg
        console.log('query error', err2.message);
      } else {
        //redirect to home page
        response.redirect("/");
      };
    });
  });
};




app.post('/pokemon', (req, response) => {
  let params = req.body;

  const queryString = 'INSERT INTO pokemon (name, height) VALUES($1, $2)'
  const values = [params.name, params.height];

  client.connect((err) => {
    if (err) console.error('connection error:', err.stack);

    client.query(queryString, values, (err, res) => {
      if (err) {
        console.error('query error:', err.stack);
      } else {
        console.log('query result:', res);

        // redirect to home page
        response.redirect('/');
      }
      client.end();
    });
  });
});

app.get("/", goToHome);
app.get("/new", goToCreationForm);
app.get("/:id/edit", editById);
app.get("/:id", showPokemonByPriId);

app.post("/", newPokemonEntry);

app.put("/:id", saveEdits);

app.delete("/:id", deletePokemonById);

/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
app.listen(3000, () => console.log('~~~ Tuning in to the waves of port 3000 ~~~'));