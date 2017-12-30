'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('node-uuid');

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

   const params = {
     TableName: process.env.TABLE_NAME,
     Item: {
       id: uuid.v1(),
       type: "Airport to Hotel",
       airport: data.airport,
       airline: data.airline,
       flightNumber: data.flightNumber,
       pickupDate: data.pickupDate,
       estimatedArrival: data.estimatedArrival,
       hotel: data.hotel,
       hotelReference: data.hotelReference,
       hotelReservationName: data.hotelReservationName,
       overnight: data.overnight,
       overnightDropoffdate: data.overnightDropoffdate,
       status: "Awaiting Payment",
       createdAt: timestamp
     },
   };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create the booking.',
      });
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
};

module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  if (typeof data.text !== 'string' || typeof data.checked !== 'boolean') {
    console.error('Validation Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
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
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the todo item.',
      });
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
});
};

module.exports.scan = (event, context, callback) => {
   
  var AWS = require('aws-sdk'),
  documentClient = new AWS.DynamoDB.DocumentClient(); 

  var params = {
      TableName : process.env.TABLE_NAME
    };
    documentClient.scan(params, function(err, data){
      if(err){
          callback(err, null);
      }else{
          const response = {
             statusCode: 200,
             body: JSON.stringify({
               Myresult: data.Items,
               input: event,
             }),
           };
          callback(null, response);
      }
  });
};