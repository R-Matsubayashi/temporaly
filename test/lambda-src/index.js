const parser = require('xml2json');
const fs = require('fs');
exports.handler = async (event) => {
  let response = {};
  console.log("Starting ...");
  let query = "";
  let parent = "";
  if (event.queryStringParameters !== null) {
    query = event.queryStringParameters.query;
    parent = event.queryStringParameters.parent;
    if (query === undefined) {
      query = "";
    }
    if (parent === undefined) {
      parent = "";
    }
  }
  let values = [];
  if (event.multiValueQueryStringParameters !== null) {
    values = event.multiValueQueryStringParameters.values;
  }
  try {
    const readXml = fs.readFileSync('choice.xml', "utf-8");
    const readJson = JSON.parse(parser.toJson(readXml));
    let responseJson = {
      items: {
        item: []
      }
    };
    const items = readJson.items.item;
    for (let i = 0; i < items.length; i++) {
      if (items[i].display.indexOf(query) !== -1) {
        //displayにqueryで指定された文字列を含むものを選ぶ
        //queryが指定されていない場合は全て通す
        if (items[i].value.startsWith(parent)) {
          //valueがparentで指定された文字列から始まるものを選ぶ
          //parentが指定されていない場合は全て通す
          if ((values === undefined) || (values.length === 0) || (values.indexOf(items[i].value) !== -1)) {
            //valueがvaluesに含まれる文字列と完全一致するものを選ぶ
            //valuesが指定されていない場合は全て通す
            responseJson.items.item.push(items[i]);
          }
        }
      }
    }
    const responseXml = parser.toXml(responseJson)
    response = formatResponse(responseXml);
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