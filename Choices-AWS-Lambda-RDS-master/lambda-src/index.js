const mysql = require('promise-mysql');
const builder = require('xmlbuilder');
const db_config = {
  host   : process.env['endpoint'],
  user   : process.env['user'],
  password : process.env['password'],
  database : process.env['db']
};
const table = process.env['table'];
const pool = mysql.createPool(db_config);
 
exports.handler = async (event) => {
  let response = {};
  console.log("Starting query ...");
  try {
    const xpath = require('xpath');
    //const dom = require('xmldom').DOMParser;
    const fs = require('fs');
    const xml = fs.readFileSync('test.xml', "utf-8");
    response = formatResponse(xml);
  } catch (e) {
    console.log(e);
    response = formatError(e);
  } finally {
    return response;
  }
 
};
 
function buildXml (results) {
  const resultsNum = results.length;
  let root = builder.create('items');
  for (let i = 0; i < resultsNum; i++) {
    let item = root.ele('item');
    item.att('value', results[i].value);
    item.att('display', results[i].display);
  }
  const xml = root.end({ pretty: true});
  return xml;
}
 
function formatResponse (body) {
  const response = {
    "statusCode": 200,
    "headers": {
      "Content-Type": "text/plain; charset=utf-8"
    },
    "isBase64Encoded": false,
    "body": body,
  };
  return response;
}
 
function formatError (error) {
  const response = {
    "statusCode": error.statusCode,
    "headers": {
      "Content-Type": "text/plain",
      "x-amzn-ErrorType": error.code
    },
    "isBase64Encoded": false,
    "body": error.code + ": " + error.message
  };
  return response;
}
