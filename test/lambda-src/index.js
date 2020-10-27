 
exports.handler = async (event) => {
  let response = {};
  console.log("Starting query ...");
  try {
    //const xpath = require('xpath');
    //const dom = require('xmldom').DOMParser;
    const fs = require('fs');
    const xml = fs.readFileSync('test.xml', "utf-8");
    console.log(xml);
    response = formatResponse(xml);
  } catch (e) {
    console.log(e);
    response = formatError(e);
  } finally {
    return response;
  }
};
 
function formatResponse (body) {
  console.log("format");
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
