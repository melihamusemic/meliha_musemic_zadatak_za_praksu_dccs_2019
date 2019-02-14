var Pool = require('pg').Pool;
var config = {
     host: 'localhost',
     user: 'meliha',
     password: 'meliha123',
     database: 'DB',
     port: 5432
};

var pool = new Pool(config);

// getting data for first tab (administration)
const getAll = (request, response) => {
     const name = request.query.formularName;

     pool.query("SELECT * FROM get_from_db('" + name + "')", (error, results) => {
          if (error) {
               console.log("err " + error);
               throw error
          }
          response.status(200).jsonp(results.rows)

     })
}

// getting informations about radio button labels
const getRButtons = (request, response) => {
     const name = request.query.formularName;
     pool.query("SELECT * FROM radiobutton INNER JOIN element ON element.elementid = radiobutton.elementid  INNER JOIN formular ON element.formularid = formular.formularid WHERE formularname = '" + name + "'  ORDER BY buttonid", (error, results) => {
          if (error) {
               console.log("err " + error);
               throw error
          }
          response.status(200).jsonp(results.rows)

     })
}

// store data about created formular 
const createFormular = (request, response) => {
     console.log(JSON.stringify(request.query));
     pool.query(" SELECT * FROM insert_from_json('" + JSON.stringify(request.query) + "')", (error, results) => {
          if (error) {
               throw error
          }
          response.status(200).jsonp(results.rows)
     })
}

// formular names for select in second tab (formular)
const getFormularNames = (request, response) => {
     pool.query("SELECT DISTINCT formularname FROM formular", (error, results) => {
          if (error) {
               console.log("err " + error);
               throw error
          }
          response.status(200).jsonp(results.rows)

     })
}

// getting from database filled or blank forms 
const getFilledFormular = (request, response) => {
     const name = request.query.formularName;
     const version = request.query.version;
     pool.query("SELECT * FROM get_filled_formular_from_db('" + name + "'," + version + ")", (error, results) => {
          if (error) {
               console.log("err " + error);
               throw error
          }
          response.status(200).jsonp(results.rows);
     })
}

// send data to fill form
const fillFormular = (request, response) => {
     pool.query(" SELECT * FROM fill_formular_from_json('" + JSON.stringify(request.query) + "')", (error, results) => {
          if (error) {
               console.log("createFormular error");
               throw error
          }
          response.status(200).jsonp(results.rows)
     })
}

module.exports = {
     getAll,
     getRButtons,
     createFormular,
     getFormularNames,
     getFilledFormular,
     fillFormular
}