'use strict';
const fs = require('fs');
const { Client } = require('pg');
let json_path = '../angular_client/src/assets/config/translations.json';

var access = JSON.parse(fs.readFileSync('C:/!dropbox/Dropbox/!csp-access/csp-db-dev/access.json', 'utf8'));
const config = {
  user: access.db_user,
  host: access.db_server,
  database: access.db_name,
  password: access.db_password,
  port: access.db_port
};

const client = new Client(config);
client.connect();

client.query('SELECT * FROM tea.translations;')
  .then(res => {
    saveAsJson(res.rows);
  })
  .catch(e => {
    console.error(e.stack);
  });

function saveAsJson(data){
  console.log('translationsFromSQL - starting..');
  let ob = {};
  data.forEach((item)=>{
    var variable_name = item.variable_name;
    ob[variable_name] = [item.lv,item.en,item.used,item.html];
  });
  var str = JSON.stringify(ob, null, 4);
  fs.writeFile(json_path, str, (err) => {
    if (err) {
      console.error('translationsFromSQL - ERROR');
      console.error(err);
      throw err;
    }
    console.log('translationsFromSQL - SUCCESS');
  })
}
