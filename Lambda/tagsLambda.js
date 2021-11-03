const { Client } = require('pg');

exports.handler = async function (event, context, callback) {
  const client = new Client();

  let ret = {
    "body": "",
    "headers": {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    "statusCode": 0,
    "isBase64Encoded": false
  }

  try {
    await client.connect();
    const query = 'SELECT DISTINCT p.categoryname FROM tags p';
    const res = await client.query(query);
    console.log(query);

    if (res.rows.length === 0) {
      console.log(res.rows.length);
      ret.statusCode = 404;
      ret.body = 'No categories found';
    } else {
      console.log(res.rows.length);
      ret.statusCode = 200;
      ret.body = JSON.stringify(res.rows);
    }
  } catch (err) {
    console.log(`error: ${err}`);
    ret.statusCode = 500;
    ret.body = JSON.stringify(err);
  } finally {
    client.end();
  }

  console.log(JSON.stringify(ret));

  callback(null, ret);
}