var fs = require('fs')
const http = require('http')
const username = 'Super manager'
const password = ''
const hostname = 'localhost'
const port = 50301

const options = {
  hostname,
  port,
  path: '/api/rest/documentation',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': "Basic " + Buffer.from(username + ':' + password).toString('base64')
  }
}

function CleanType(object) {
  for (var property in object) {
    if (object.hasOwnProperty(property)) {
      if (object[property] instanceof Object) {
        object[property] = CleanType(object[property])
      }
      if (property == "type" && object[property] instanceof Array) {
        //Swagger does not support type property as an array
        var array = object[property]
        delete object[property]
        object[property] = array[0]
      }
      if (property == "ancestors" ) {
        delete object[property]
      }
      if (property == "description" && typeof (object[property]) == "string") {
        //remove extra spaces causing issues in markdown display
        object[property] = object[property].replace(/( {2,})/g, ' ');
      }
      if (property == "goldType") {
        if (object["format"] == undefined) {
          object["format"] = object[property];
        }
        //goldType is not managed by swagger, so removing it
        delete object[property]
      }
      if (property == "enum") {
        object["type"] = "string"
      }
      if (property == "items" && object[property] instanceof Array) {
        for (var i in object[property]) {
          if (object[property][i]["$ref"]) {
            delete object[property][i]["$ref"]
          }
        }
      }
      if (property == "enumNames") {
        //EnumNames is not managed by swagger, so removing it
        delete object[property]
      }
      if (property == "country" && object[property] instanceof Object && object[property].enum) {
        //EnumNames is not managed by swagger, so removing it
        object[property].enum = ["UNITED STATES", "FRANCE", "CANADA"]
      }
    }
  }
  return object
}

console.log(`Connection to: ${options.hostname}:${options.port}${options.path}, this can take up to 60s`);
http.request(options, (resp) => {
  console.log(`STATUS: ${resp.statusCode}`);
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    try {
      var spec = JSON.parse(data)
      spec.host = hostname + ':' + port
      //Add basic auth security
      spec.securityDefinitions={
        basicAuth: {
          type: "basic"
        }
      }
      spec.security=[{"basicAuth":[]}]
      spec=CleanType(spec)
      fs.writeFileSync("wynsure-spec.js", 'var spec =' + JSON.stringify(spec, null, '\t'))
      console.log('swagger spec updated')
    }
    catch (e) { console.error("Cannot save report") }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
}).end();


