var fs = require('fs')
var Path = require('path')

const argv = require('yargs').argv
const PORT = argv.port

var faker = require('faker')
const USERNAME = 'Super manager'
const PASSWORD =''
const TESTFOLDER = '../Samples/'
const PARAMS = {
  "personBUID": "318842869_22",
  "PersonLastName": faker.name.lastName(),
  "currentDate":"2018-01-01"
}

var reporters = require('jasmine-reporters');
var junitReporter = new reporters.JUnitXmlReporter({
  savePath: __dirname + '/reports',
  consolidateAll: false
});
jasmine.getEnv().addReporter(junitReporter)

const frisby = require('frisby');

function collectTestPaths(basePath) {
  const testPaths = []
  function analyzeFile(path) {
    const fstat = fs.statSync(path)
    if (fstat.isDirectory()) {
      for (const cname of fs.readdirSync(path)) {
        analyzeFile(Path.join(path, cname))
      }
    }
    else {
      testPaths.push(path)
    }
  }
  analyzeFile(basePath)
  testPaths.sort()
  return testPaths
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function executeTest(path) {
  try {
    var content = fs.readFileSync(path).toString()
    for (key in PARAMS) {
      content=replaceAll(content,`{{${key}}}`, PARAMS[key])
    }

    var source = JSON.parse(content)
    source.className && describe("Calling " + path, function () {
      it('File ' + path + ' should be successfull', function () {
        return frisby
          .post(`http://localhost:${PORT}/api/rpc/${source.className}/${source.methodName}`, source.request)
          //.inspectBody()
          //.inspectResponse()
          .expect('status', 200)
          //.expectNot('json', { result: 'error' })
          .then((response) => {
            if (response.status == 200 && response.json._Result === null) {
              throw new Error(`Response is a success (200) but nothing is returned`);
            }
            if (response.status == 400) {
              //throw new Error(``);
            }
          }, (error) => {

          })
      })
    });
  } catch (e) {
    console.error('error in json file: '+ path)
  }
}

function runImport(username, password) {
  frisby.globalSetup({
    request: {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
        'Content-Type': 'application/json',
      }
    },
    timeout: 10000
  });
  for (const testPath of collectTestPaths(TESTFOLDER)) {
    executeTest(testPath);
  }
}

runImport(USERNAME, PASSWORD)