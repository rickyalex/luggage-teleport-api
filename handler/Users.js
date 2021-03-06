const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const uuid = require('node-uuid');
const dynamoDb = new AWS.DynamoDB.DocumentClient();


module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  var locationId = process.env.LOCATION_ID;

      const params = {
        TableName: process.env.TABLE_NAME8,
        Item: {
            id: uuid.v1(),
            img: data.img,
            email: data.email,
            createdAt: timestamp
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
            body: 'Couldn\'t create the User',
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
};

// module.exports.scan = (event, context, callback) => {

//   var params = {
//       TableName : process.env.TABLE_NAME8,
//     };
//     dynamoDb.scan(params, function(err, data){
//       if(err){
//           callback(err, null);
//       }else{
//           const response = {
//              statusCode: 200,
//              body: JSON.stringify({
//                Myresult: data.Items,
//                input: event,
//              }),
//              headers: { 
//               'Content-Type': 'application/json',
//               'Access-Control-Allow-Origin' : '*'
//             },
//            };
//           callback(null, response);
//       }
//   });
// };

module.exports.get = (event, context, callback) => {

  var params = {
    TableName: process.env.TABLE_NAME8,
    IndexName : 'email',
    KeyConditionExpression: "email = :e",
    ExpressionAttributeValues: {
        ":e": event.pathParameters.id
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