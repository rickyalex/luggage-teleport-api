'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('node-uuid');
var unirest = require('unirest');
var base_url = 'https://connect.squareup.com/v2';
const sgMail = require('@sendgrid/mail');

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);
  var token = require('crypto').randomBytes(64).toString('hex');

  var request_body = {
    card_nonce: data.cardNonce,
    amount_money: {
      amount: data.TotalCost * 100,
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
            BookingId: data.BookingId,
            airport: data.airport,
            airline: data.airline,
            flightNumber: data.flightNumber,
            pickupDate: data.pickupDate,
            hotel: data.hotel,
            hotelReference: data.hotelReference,
            hotelReservationName: data.hotelReservationName,
            dropoffDate: data.dropoffDate,
            status: "Order being processed",
            bookingType: 'ATH',
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
            body: JSON.stringify(error),
          });
          return;
        }

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: params.Item.email,
          from: 'no-reply@luggageteleport.com',
          bcc: 'luggageteleport2017@gmail.com',
          subject: 'Luggage Teleport Receipt',
          text: params.Item.BookingId,
          html: '<img src="https://s3-us-west-1.amazonaws.com/luggageteleport.net/img/frame01.png"  width="377" height="auto"/>'+'<br><br>'+
                '<strong>Thank you for trusting your luggages with us !</strong>'+'<br><br>'+
                'Your Booking ID : '+params.Item.BookingId+'<br>'+
                'Booking : Airport to Hotel<br>'+
                'Email : '+params.Item.email+'<br>'+
                'Phone Number : '+params.Item.phone+'<br>'+
                'Number of bags : '+params.Item.LuggageQuantity+'<br>'+
                'Price : $'+params.Item.TotalCost+'<br>'+
                '<strong>Pick Up Point </strong>'+'<br>'+
                'Pickup Airport : '+params.Item.airport+'<br>'+
                'Airline : '+params.Item.airline+'<br>'+
                'Flight Number : '+params.Item.flightNumber+'<br>'+
                'Pickup Time: '+params.Item.pickupDate+'<br>'+
                '<strong>Drop Off Point </strong>'+'<br>'+
                'Dropoff Hotel : '+params.Item.hotel+'<br>'+
                'Hotel Reference : '+params.Item.hotelReference+'<br>'+
                'Guest Name: '+params.Item.hotelReservationName+'<br><br>'+
                'Dropoff Time: '+params.Item.dropoffDate+'<br>'+
                '<img src="https://s3-us-west-1.amazonaws.com/luggageteleport.net/img/frame02.png"  width="377" height="auto"/>'
        };
        sgMail.send(msg);

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

//module.exports.update = (event, context, callback) => {
  //const timestamp = new Date().getTime();
  //const data = JSON.parse(event.body);

  //return JSON.stringify(event);
  
  // if (typeof data.status !== 'string') {
  //   console.error('Validation Failed');
  //   callback(null, {
  //     statusCode: 400,
  //     headers: { 
  //         'Content-Type': 'application/json',
  //         'Access-Control-Allow-Origin' : '*'
  //       },
  //     body: JSON.stringify(data),
  //   });
  //   return;
  // }

  // const params = {
  //   TableName: process.env.TABLE_NAME,
  //   Key: {
  //     "id": event.pathParameters.id,
  //   },
  //   UpdateExpression: "SET #status = :status",
  //   ExpressionAttributeNames: {
  //     "#status": "status",
  //   },
  //   ExpressionAttributeValues: {
  //     ":status": event.queryStringParameters.status
  //   },
  //   ReturnValues: "UPDATED_NEW"
  // };

  // dynamoDb.update(params, function(error, data) {
  //   if (error) {
  //     console.error(error);
  //     callback(null, {
  //       statusCode: error.statusCode || 501,
  //       headers: { 
  //         'Content-Type': 'application/text-plain',
  //         'Access-Control-Allow-Origin' : '*'
  //       },
  //       body: "Error",
  //     });
  //     return;
  //   }

  //   const response = {
  //     statusCode: 200,
  //     body: JSON.stringify({
  //       result: data,
  //       input: event
  //     }),
  //     headers: { 
  //         'Content-Type': 'application/json',
  //         'Access-Control-Allow-Origin' : '*' 
  //       },
  //   };
  //   callback(null, response);
  // });
//};

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