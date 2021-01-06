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
      //指定されてない場合空文字列にする
      query = "";
    }
    if (parent === undefined) {
      //指定されてない場合空文字列にする
      parent = "";
    }
  }
  let values = [];
  if (event.multiValueQueryStringParameters !== null) {
    values = event.multiValueQueryStringParameters.values;
  }

  try {
    const readXml = await streamFileRead('choice.xml'); //ファイル読み込み、完了まで待機
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

function streamFileRead(fileName) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(fileName, {
      encoding: "utf8",         // 文字コード
      highWaterMark: 1024       // 一度に取得するbyte数
    });
    let data = "";     // 読み込んだデータ

    // データを取得する度に実行される
    stream.on("data", (chunk) => {
      data += chunk.toString("utf8");
    });

    // データをすべて読み取り終わったら実行される
    stream.on("end", () => {
      resolve(data)
    });

    // エラー処理
    stream.on("error", (err) => {
      reject(err.message);
    });
  })
}