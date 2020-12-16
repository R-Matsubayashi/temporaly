const parser = require('xml2json');
const fs = require('fs');
exports.handler = async (event) => {
  let response = {};
  console.log("Starting ...");
  let quary = "";
  let parent = "";
  if (event.queryStringParameters !== null) {
    quary = event.queryStringParameters.quary;
    parent = event.queryStringParameters.parent;
  }
  //let values = event.multiValueQueryStringParameters.values;
  try {
    const read = fs.readFileSync('choice.xml', "utf-8");
    const json = JSON.parse(parser.toJson(read));
    let xml = {
      items: {
        item:[]
      }
    };
    if(quary !== ""){
      const item = json.items.item;
      for(let i = 0; i < json.length; i++){
        if(item[i].indexOf(quary) !== -1){
          xml.items.item.push(item[i]);
        }
      }
    }else{
      xml = json;
    }
    xml = JSON.stringify(xml)
    response = formatResponse(parser.toXml(xml,'utf-8'));
  } catch (e) {
    console.log(e);
    response = formatError(e);
  } finally {
    return response;
  }
};

function formatResponse(body) {
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

function formatError(error) {
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