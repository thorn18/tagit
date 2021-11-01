const { Client } = require('pg');

exports.handler = async function (event, context, callback) {
  console.log(`path = ${event.path}`);

  const body = JSON.parse(event.body);
  
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

  //If the API was called for the /login resource, check their username and password
  //If it was called for /register, add them to the database
  //Otherwise, throw a 405

  //LOGIN
  if (event.path.slice(event.path.lastIndexOf('/') + 1) === 'login') {
    //find the user
    const query = 'SELECT u.userid, u.firstname, u.lastname, u.password FROM users u WHERE username = $1::text';
    console.log(query);
    try {
      await client.connect();
      console.log('connected!');
      const res = await client.query(query, [body.username] );

      if (res.rows.length === 0) {
        console.log("404 error");
        ret.statusCode = 404;
        console.log(`User ${body.username} is not in database`);
        ret.body = `User ${body.username} is not in database`;
      } else if (res.rows[0].password === body.password) {
        console.log(`Correct Password`);
        ret.statusCode = 200;
        ret.body = JSON.stringify({
          "userid": res.rows[0].userid,
          "firstname": res.rows[0].firstname,
          "lastname": res.rows[0].lastname
        });
      } else {
        console.log("incorrect password")
        ret.statusCode = 401;
        ret.body = 'Incorrect password';
      }
    } catch (err) {
      console.log(`error: ${err}`);
      ret.statusCode = 500;
      ret.body = JSON.stringify(err);
    } finally {
      client.end();
    }

    //REGISTER
  } else if (event.path.slice(event.path.lastIndexOf('/') + 1) === 'register') {
    const date = new Date();
    const query = 'INSERT INTO users (username, password, email, firstname, lastname, timestamp) VALUES ($1::text, $2::text, $3::text, $4::text, $5::text, $6::timestamp) RETURNING userid, firstname, lastname';
    console.log(query);

    try {
      await client.connect();
      const res = await client.query(query, [ body.username, body.password, body.email, body.firstname, body.lastname, date ]);
      ret.statusCode = 201;
      ret.body = JSON.stringify({
        "userid": res.rows[0].userid,
        "firstname": res.rows[0].firstname,
        "lastname": res.rows[0].lastname
      });
    } catch (err) {
      //most common error is that the username is already taken: have a specific error message for this
      if(err.code === "23505") {
        ret.statusCode = 405;
        //"detail": "Key (username)=(ATest2) already exists.",
        const key = err.detail.slice( err.detail.indexOf("(") + 1 , err.detail.indexOf(")"));
        const val = err.detail.slice( err.detail.lastIndexOf("(") + 1, err.detail.lastIndexOf(")"));
        ret.body = `${key} "${val}" has been taken`;
      } else {
        ret.statusCode = 500;
        ret.body = JSON.stringify(err);
      }
    } finally {
      client.end();
    }

    //WRONG PATH
  } else {
    console.log(`path ${event.path} did not end in login or register, it ended in ${event.path.slice(event.path.lastIndexOf('/'))}`);
    ret.statusCode = 405;
    ret.body = 'This function needs to be accessed from /login or /register';
  }

  console.log(JSON.stringify(ret));

  callback(null, ret);
}