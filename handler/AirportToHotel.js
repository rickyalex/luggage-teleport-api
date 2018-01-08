'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('node-uuid');
var unirest = require('unirest');
var base_url = 'https://connect.squareup.com/v2';

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  var token = require('crypto').randomBytes(64).toString('hex');

  var request_body = {
    card_nonce: data.cardNonce,
    amount_money: {
      amount: data.TotalCost,
      currency: 'USD'
    },
    idempotency_key: token
  }

  var locationId = process.env.LOCATION_ID;

  unirest.post(base_url + '/locations/' + locationId + "/transactions")
    .headers({
      'Authorization': 'Bearer ' + process.env.SQUARE_ACCESS_TOKEN,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
    .send(request_body)
    .end((resp) => {
    if (resp.body.errors){
      console.error(resp.body.errors);
      callback(null, {
        statusCode: resp.body.errors.statusCode || 501,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : '*'
        },
        body: 'Couldn\'t charge the booking.',
      });
    } else {

      const params = {
        TableName: process.env.TABLE_NAME,
        Item: {
          id: uuid.v1(),
          airport: data.airport,
          airline: data.airline,
          flightNumber: data.flightNumber,
          pickupDate: data.pickupDate,
          estimatedArrival: data.estimatedArrival,
          hotel: data.hotel,
          hotelReference: data.hotelReference,
          hotelReservationName: data.hotelReservationName,
          dropoffDate: data.dropoffDate,
          status: "Awaiting Payment",
          createdAt: timestamp,
          email: data.email,
          phone: data.phone,
          PaymentWith: data.PaymentWith,
          LuggageQuantity: data.LuggageQuantity,
          TotalCost: data.TotalCost,
          transaction: resp.body.transaction.id
        },
      };

      dynamoDb.put(params, (error) => {
        if (error) {
          console.error(error);
          callback(null, {
            statusCode: error.statusCode || 501,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: 'Couldn\'t create the booking.',
          });
          return;
        }

        const response = {
          statusCode: 200,
          body: JSON.stringify(params.Item),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        };
        callback(null, response);
      });
    }
  });
};

module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  if (typeof data.text !== 'string' || typeof data.checked !== 'boolean') {
    console.error('Validation Failed');
    callback(null, {
      statusCode: 400,
      headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : '*'
        },
      body: 'Couldn\'t update the booking.',
    });
    return;
  }

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':updatedAt': timestamp,
    },
    UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW',
  };

  dynamoDb.update(params, (error, result) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : '*'
        },
        body: 'Couldn\'t fetch the todo item.',
      });
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
      headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : '*' 
        },
    };
    callback(null, response);
});
};

module.exports.scan = (event, context, callback) => {

  var params = {
      TableName : process.env.TABLE_NAME,
    };
    dynamoDb.scan(params, function(err, data){
      if(err){
          callback(err, null);
      }else{
          const response = {
             statusCode: 200,
             body: JSON.stringify({
               Myresult: data.Items,
               input: event,
             }),
             headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin' : '*'
            },
           };
          callback(null, response);
      }
  });
};

module.exports.get = (event, context, callback) => {

  var params = {
    TableName: process.env.TABLE_NAME,
    IndexName : 'email',
    KeyConditionExpression: "email = :e",
    ExpressionAttributeValues: {
        ":e": event.pathParameters.email
    }
  };
    dynamoDb.query(params, function(err, data){
      if (err) {
        console.error(err);
        callback(null, {
          statusCode: err.statusCode || 501,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Couldn\'t fetch the booking item.',
        });
        return;
      }
      else{
          const response = {
             statusCode: 200,
             body: JSON.stringify({
               result: data.Items,
               input: event,
             }),
             headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin' : '*'
            },
           };
          callback(null, response);
      }
  });
};