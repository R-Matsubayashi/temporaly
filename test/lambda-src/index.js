const parser = require('xml2json');
const fs = require('fs');
exports.handler = async (event) => {
  let response = {};
  console.log("Starting ...");
  let quary = event.queryStringParameters.quary;
  let parent = event.queryStringParameters.parent;
  //let values = event.multiValueQueryStringParameters.values;
  try {
    const xml = fs.readFileSync('choice.xml', "utf-8");
    const json = parser.toJson(xml);
    console.log(json)
    response = formatResponse(xml);
  } catch (e) {
    console.log(e);
    response = formatError(e);
  } finally {
    return response;
  }
};

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