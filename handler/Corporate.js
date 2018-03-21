'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('node-uuid');
const sgMail = require('@sendgrid/mail');

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  var locationId = process.env.LOCATION_ID;

      const params = {
        TableName: process.env.TABLE_NAME9,
        Item: {
            id: uuid.v1(),
            BookingId: data.BookingId,
            HotelDropoff: data.HotelDropoff,
            HotelDropoffBookingRef: data.HotelDropoffBookingRef,
            HotelDropoffDate: data.HotelDropoffDate,
            HotelPickup: data.HotelPickup,
            HotelPickupBookingRef: data.HotelPickupBookingRef,
            HotelPickupDate: data.HotelPickupDate,
            OvernightStorage: data.OvernightStorage,
            RsvpNameHotelDropoff: data.RsvpNameHotelDropoff,
            RsvpNameHotelPickup: data.RsvpNameHotelPickup,
            email: data.email,
            PhoneNumber: data.PhoneNumber,
            status: "Order being processed",
            createdAt: timestamp,
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

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: params.Item.email,
          from: 'no-reply@luggageteleport.com',
          bcc: 'rickyalex88@gmail.com',
          subject: 'Luggage Teleport Receipt',
          text: params.Item.BookingId,
          html: '<img src="https://s3-us-west-1.amazonaws.com/luggageteleport.net/img/frame01.png"  width="377" height="auto"/>'+'<br><br>'+
                '<strong>Thank You for booking with us !</strong>'+'<br><br>'+
                'Your Booking ID : '+params.Item.BookingId+'<br>'+
                'Booking : Airport to Hotel<br>'+
                'Email : '+params.Item.email+'<br>'+
                'Phone Number : '+params.Item.phone+'<br>'+
                'Number of bags : '+params.Item.LuggageQuantity+'<br>'+
                'Price : $'+params.Item.TotalCost+'<br>'+
                '<strong>Pick Up Point </strong>'+'<br>'+
                'Hotel : '+params.Item.HotelPickup+'<br>'+
                'Hotel Reference : '+params.Item.HotelPickupBookingRef+'<br>'+
                'Pick Up Date: '+params.Item.HotelPickupDate+'<br>'+
                '<strong>Drop Off Point </strong>'+'<br>'+
                'Hotel : '+params.Item.HotelDropoff+'<br>'+
                'Hotel Reference : '+params.Item.HotelDropoffBookingRef+'<br>'+
                'Drop Off Date : '+params.Item.HotelDropoffDate+'<br>'+
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
    TableName: process.env.TABLE_NAME9,
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
      TableName : process.env.TABLE_NAME9,
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
    TableName: process.env.TABLE_NAME9,
    // Item: {
    //         trackingNumber: data.trackingNumber,
    //         expectedDeliveryDate: data.expectedDeliveryDate,
    //         departureDate: data.departureDate,
    //         departureStatus: data.departureStatus
    //     },
    IndexName : 'trackingNumber',
    KeyConditionExpression: "trackingNumber = :e",
    ExpressionAttributeValues: {
        ":e": event.pathParameters.trackingNumber
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
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        if(event.pathParameters.sequence==1){
          //if this is the initial email sequence
            const msg = {
              to: ['max@luggageteleport.com', 'thomas@luggageteleport.net'],
              from: 'no-reply@luggageteleport.com',
              bcc: 'rickyalex88@gmail.com',
              subject: 'Your Luggage Teleport Status',
              text: data.Items[0].trackingNumber,
              html: '<head>'+
                      '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'+
                      '<title>A Simple Responsive HTML Email</title>'+
                          '<style type="text/css">'+
                          "@import url('https://fonts.googleapis.com/css?family=Oswald');"+
                          'body {margin: 0; padding: 0; min-width: 100%!important;}'+
                          '.content {width: 100%; max-width: 600px;}'+
                          '@media only screen and (min-device-width: 601px) {'+
                          '.content {width: 600px !important;}'+
                          '}'+
                          '.header {padding: 40px 30px 20px 30px;}'+
                          '.col425 {width: 425px!important;}'+
                          '.subhead {font-size: 15px; color: #ffffff; font-family: sans-serif; letter-spacing: 5px;}'+
                          '.h1 {font-size: 28px; line-height: 38px; font-weight: bold;}'+
                          ".header .h1, .header .h2, .header .bodycopy {color: #e8ef09; font-family: 'Oswald', sans-serif;}"+
                          '.innerpadding {padding: 30px 30px 30px 30px;}'+
                          '.borderbottom {border-bottom: 1px solid #f2eeed;}'+
                          ".h2 {padding: 0 0 15px 0; font-size: 24px; line-height: 28px; font-weight: bold;font-family: 'Oswald', sans-serif;}"+
                          ".bodycopy {font-size: 16px; line-height: 22px;font-family: 'Oswald', sans-serif;}"+
                          'h4 {margin: 5px 0;color:#0c0784;}'+
                          '.bodycopy img {display:block;margin:10px auto;}'+
                          '</style>'+
                      '</head>'+
                      '<body bgcolor="#f6f8f1">'+
                          '<!--[if (gte mso 9)|(IE)]>'+
                          '<table width="600" align="center" cellpadding="0" cellspacing="0" border="0">'+
                            '<tr>'+
                              '<td>'+
                              '<![endif]-->'+
                              '<table class="content" align="center" cellpadding="0" cellspacing="0" border="0">'+
                                  '<tr>'+
                                      '<td class="header" bgcolor="#09aaef">'+
                                          '<table width="70" align="left" border="0" cellpadding="0" cellspacing="0">'+
                                              '<tr>'+
                                                  '<td height="70" style="padding: 0 20px 20px 0;">'+
                                                    '<img src="https://s3-us-west-1.amazonaws.com/luggageteleport.net/img/luggage.png" width="70" height="70" border="0" alt="" / >'+
                                                  '</td>'+
                                              '</tr>'+
                                          '</table>'+
                                          '<!--[if (gte mso 9)|(IE)]>'+
                                          '<table width="425" align="left" cellpadding="0" cellspacing="0" border="0">'+
                                            '<tr>'+
                                              '<td>'+
                                                '<![endif]-->'+
                                                '<table class="col425" align="left" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 425px;">'+
                                                  '<tr>'+
                                                    '<td height="70">'+
                                                      '<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
                                                        '<tr>'+
                                                            '<td class="subhead" style="padding: 0 0 0 3px;">'+
                                                                'LUGGAGE TELEPORT'+
                                                            '</td>'+
                                                        '</tr>'+
                                                        '<tr>'+
                                                            '<td class="h1" style="padding: 5px 0 0 0;">'+
                                                                'Your Luggage Delivery Status'+
                                                            '</td>'+
                                                        '</tr>'+
                                                    '</table>'+
                                                    '</td>'+
                                                  '</tr>'+
                                                '</table>'+
                                                '<!--[if (gte mso 9)|(IE)]>'+
                                              '</td>'+
                                            '</tr>'+
                                          '</table>'+
                                          '<![endif]-->'+
                                      '</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                      '<td class="innerpadding borderbottom">'+
                                          '<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
                                              '<tr>'+
                                                  '<td class="h2">'+
                                                      'Hello,'+
                                                  '</td>'+
                                              '</tr>'+
                                              '<tr>'+
                                                  '<td class="bodycopy">'+
                                                      '<h4>Tracking Number:</h4>'+
                                                      data.Items[0].trackingNumber+'<br>'+
                                                      '<img src="https://s3-us-west-1.amazonaws.com/luggageteleport.net/img/tracking_pick.png"  width="377" height="auto"/>'+
                                                      'Expected Delivery Day : '+data.Items[0].expectedDeliveryDate+'<br>'+
                                                      'Luggage has been picked up and is waiting for the next available truck<br>'+
                                                      '<div style="padding:10px 0;line-height: 25px">'+
                                                        '<h4>Tracking History:</h4>'+
                                                        data.Items[0].departureDate+'<br>'+
                                                        data.Items[0].departureStatus+'<br>'+
                                                      '</div>'+
                                                  '</td>'+
                                              '</tr>'+
                                          '</table>'+
                                      '</td>'+
                                  '</tr>'+
                                  '</table>'+
                      '</body>'
            };
            sgMail.send(msg);

            const msg2 = {
              to: ['max@luggageteleport.com', 'thomas@luggageteleport.net'],
              from: 'no-reply@luggageteleport.com',
              bcc: 'rickyalex88@gmail.com',
              subject: 'MAX - Your Luggage Teleport Status',
              text: data.Items[0].trackingNumber,
              html: 'Click here for In Transit : <a href="https://s3-us-west-1.amazonaws.com/luggageteleport-test.net/index.html#/emailhandler?trackingNumber=LV02340005&sequence=2" target="_blank">Update to In Transit</a><br>'+
                    'Click here for for Delivered : <a href="https://s3-us-west-1.amazonaws.com/luggageteleport-test.net/index.html#/emailhandler?trackingNumber=LV02340005&sequence=3" target="_blank">Update to Delivered</a>'
            };
            sgMail.send(msg2);
        }
        else if(event.pathParameters.sequence==2){
          //if this is the 2nd email sequence
          
            const msg = {
              to: ['max@luggageteleport.com', 'thomas@luggageteleport.net'],
              from: 'no-reply@luggageteleport.com',
              bcc: 'rickyalex88@gmail.com',
              subject: 'Your Luggage Teleport Status',
              text: data.Items[0].trackingNumber,
              html: '<head>'+
                      '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'+
                      '<title>A Simple Responsive HTML Email</title>'+
                          '<style type="text/css">'+
                          "@import url('https://fonts.googleapis.com/css?family=Oswald');"+
                          'body {margin: 0; padding: 0; min-width: 100%!important;}'+
                          '.content {width: 100%; max-width: 600px;}'+
                          '@media only screen and (min-device-width: 601px) {'+
                          '.content {width: 600px !important;}'+
                          '}'+
                          '.header {padding: 40px 30px 20px 30px;}'+
                          '.col425 {width: 425px!important;}'+
                          '.subhead {font-size: 15px; color: #ffffff; font-family: sans-serif; letter-spacing: 5px;}'+
                          '.h1 {font-size: 32px; line-height: 38px; font-weight: bold;}'+
                          ".header .h1, .header .h2, .header .bodycopy {color: #e8ef09; font-family: 'Oswald', sans-serif;}"+
                          '.innerpadding {padding: 30px 30px 30px 30px;}'+
                          '.borderbottom {border-bottom: 1px solid #f2eeed;}'+
                          ".h2 {padding: 0 0 15px 0; font-size: 24px; line-height: 28px; font-weight: bold;font-family: 'Oswald', sans-serif;}"+
                          ".bodycopy {font-size: 16px; line-height: 22px;font-family: 'Oswald', sans-serif;}"+
                          'h4 {margin: 5px 0;color:#0c0784;}'+
                          '.bodycopy img {display:block;margin:10px auto;}'+
                          '</style>'+
                      '</head>'+
                      '<body bgcolor="#f6f8f1">'+
                          '<!--[if (gte mso 9)|(IE)]>'+
                          '<table width="600" align="center" cellpadding="0" cellspacing="0" border="0">'+
                            '<tr>'+
                              '<td>'+
                              '<![endif]-->'+
                              '<table class="content" align="center" cellpadding="0" cellspacing="0" border="0">'+
                                  '<tr>'+
                                      '<td class="header" bgcolor="#09aaef">'+
                                          '<table width="70" align="left" border="0" cellpadding="0" cellspacing="0">'+
                                              '<tr>'+
                                                  '<td height="70" style="padding: 0 20px 20px 0;">'+
                                                    '<img src="https://s3-us-west-1.amazonaws.com/luggageteleport.net/img/luggage.png" width="70" height="70" border="0" alt="" / >'+
                                                  '</td>'+
                                              '</tr>'+
                                          '</table>'+
                                          '<!--[if (gte mso 9)|(IE)]>'+
                                          '<table width="425" align="left" cellpadding="0" cellspacing="0" border="0">'+
                                            '<tr>'+
                                              '<td>'+
                                                '<![endif]-->'+
                                                '<table class="col425" align="left" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 425px;">'+
                                                  '<tr>'+
                                                    '<td height="70">'+
                                                      '<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
                                                        '<tr>'+
                                                            '<td class="subhead" style="padding: 0 0 0 3px;">'+
                                                                'LUGGAGE TELEPORT'+
                                                            '</td>'+
                                                        '</tr>'+
                                                        '<tr>'+
                                                            '<td class="h1" style="padding: 5px 0 0 0;">'+
                                                                'Your Luggage Delivery Status'+
                                                            '</td>'+
                                                        '</tr>'+
                                                    '</table>'+
                                                    '</td>'+
                                                  '</tr>'+
                                                '</table>'+
                                                '<!--[if (gte mso 9)|(IE)]>'+
                                              '</td>'+
                                            '</tr>'+
                                          '</table>'+
                                          '<![endif]-->'+
                                      '</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                      '<td class="innerpadding borderbottom">'+
                                          '<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
                                              '<tr>'+
                                                  '<td class="h2">'+
                                                      'Hello,'+
                                                  '</td>'+
                                              '</tr>'+
                                              '<tr>'+
                                                  '<td class="bodycopy">'+
                                                      '<h4>Tracking Number:</h4>'+
                                                      data.Items[0].trackingNumber+'<br>'+
                                                      '<img src="https://s3-us-west-1.amazonaws.com/luggageteleport.net/img/tracking_transit.png"  width="377" height="auto"/>'+
                                                      'Expected Delivery Day : '+data.Items[0].expectedDeliveryDate+'<br>'+
                                                      'Luggage has been picked up and is waiting for the next available truck<br>'+
                                                      '<div style="padding:10px 0;line-height: 25px">'+
                                                        '<h4>Tracking History:</h4>'+
                                                        data.Items[0].transitDate+'<br>'+
                                                        'In transit to Destination'+
                                                        'On its way to '+data.Items[0].transitStatus+'<br><br>'+
                                                        '<hr style="border-top: dotted 4px;color:#999;" />'+
                                                        data.Items[0].departureDate+'<br>'+
                                                        data.Items[0].departureStatus+'<br>'+
                                                      '</div>'+
                                                  '</td>'+
                                              '</tr>'+
                                          '</table>'+
                                      '</td>'+
                                  '</tr>'+
                                  '</table>'+
                      '</body>'
            };
            sgMail.send(msg);

            const msg2 = {
              to: ['max@luggageteleport.com', 'thomas@luggageteleport.net'],
              from: 'no-reply@luggageteleport.com',
              bcc: 'rickyalex88@gmail.com',
              subject: 'MAX - Luggage Teleport Status',
              text: data.Items[0].trackingNumber,
              html: 'Click here for for Delivered : <a href="https://s3-us-west-1.amazonaws.com/luggageteleport-test.net/index.html#/emailhandler?trackingNumber=LV02340005&sequence=3" target="_blank">Update to Delivered</a>'
            };
            sgMail.send(msg2);
        }
        else if(event.pathParameters.sequence==3){
          //if this is the 2nd email sequence
            const msg = {
              to: ['max@luggageteleport.com', 'thomas@luggageteleport.net'],
              from: 'no-reply@luggageteleport.com',
              bcc: 'rickyalex88@gmail.com',
              subject: 'Your Luggage Teleport Status',
              text: data.Items[0].trackingNumber,
              html: '<head>'+
                      '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'+
                      '<title>A Simple Responsive HTML Email</title>'+
                          '<style type="text/css">'+
                          "@import url('https://fonts.googleapis.com/css?family=Oswald');"+
                          'body {margin: 0; padding: 0; min-width: 100%!important;}'+
                          '.content {width: 100%; max-width: 600px;}'+
                          '@media only screen and (min-device-width: 601px) {'+
                          '.content {width: 600px !important;}'+
                          '}'+
                          '.header {padding: 40px 30px 20px 30px;}'+
                          '.col425 {width: 425px!important;}'+
                          '.subhead {font-size: 15px; color: #ffffff; font-family: sans-serif; letter-spacing: 5px;}'+
                          '.h1 {font-size: 32px; line-height: 38px; font-weight: bold;}'+
                          ".header .h1, .header .h2, .header .bodycopy {color: #e8ef09; font-family: 'Oswald', sans-serif;}"+
                          '.innerpadding {padding: 30px 30px 30px 30px;}'+
                          '.borderbottom {border-bottom: 1px solid #f2eeed;}'+
                          ".h2 {padding: 0 0 15px 0; font-size: 24px; line-height: 28px; font-weight: bold;font-family: 'Oswald', sans-serif;}"+
                          ".bodycopy {font-size: 16px; line-height: 22px;font-family: 'Oswald', sans-serif;}"+
                          'h4 {margin: 5px 0;color:#0c0784;}'+
                          '.bodycopy img {display:block;margin:10px auto;}'+
                          '</style>'+
                      '</head>'+
                      '<body bgcolor="#f6f8f1">'+
                          '<!--[if (gte mso 9)|(IE)]>'+
                          '<table width="600" align="center" cellpadding="0" cellspacing="0" border="0">'+
                            '<tr>'+
                              '<td>'+
                              '<![endif]-->'+
                              '<table class="content" align="center" cellpadding="0" cellspacing="0" border="0">'+
                                  '<tr>'+
                                      '<td class="header" bgcolor="#09aaef">'+
                                          '<table width="70" align="left" border="0" cellpadding="0" cellspacing="0">'+
                                              '<tr>'+
                                                  '<td height="70" style="padding: 0 20px 20px 0;">'+
                                                    '<img src="https://s3-us-west-1.amazonaws.com/luggageteleport.net/img/luggage.png" width="70" height="70" border="0" alt="" / >'+
                                                  '</td>'+
                                              '</tr>'+
                                          '</table>'+
                                          '<!--[if (gte mso 9)|(IE)]>'+
                                          '<table width="425" align="left" cellpadding="0" cellspacing="0" border="0">'+
                                            '<tr>'+
                                              '<td>'+
                                                '<![endif]-->'+
                                                '<table class="col425" align="left" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 425px;">'+
                                                  '<tr>'+
                                                    '<td height="70">'+
                                                      '<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
                                                        '<tr>'+
                                                            '<td class="subhead" style="padding: 0 0 0 3px;">'+
                                                                'LUGGAGE TELEPORT'+
                                                            '</td>'+
                                                        '</tr>'+
                                                        '<tr>'+
                                                            '<td class="h1" style="padding: 5px 0 0 0;">'+
                                                                'Your Luggage Delivery Status'+
                                                            '</td>'+
                                                        '</tr>'+
                                                    '</table>'+
                                                    '</td>'+
                                                  '</tr>'+
                                                '</table>'+
                                                '<!--[if (gte mso 9)|(IE)]>'+
                                              '</td>'+
                                            '</tr>'+
                                          '</table>'+
                                          '<![endif]-->'+
                                      '</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                      '<td class="innerpadding borderbottom">'+
                                          '<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
                                              '<tr>'+
                                                  '<td class="h2">'+
                                                      'Hello,'+
                                                  '</td>'+
                                              '</tr>'+
                                              '<tr>'+
                                                  '<td class="bodycopy">'+
                                                      '<h4>Tracking Number:</h4>'+
                                                      data.Items[0].trackingNumber+'<br>'+
                                                      '<img src="https://s3-us-west-1.amazonaws.com/luggageteleport.net/img/tracking_destination.png"  width="377" height="auto"/>'+
                                                      'Expected Delivery Day : '+data.Items[0].expectedDeliveryDate+'<br>'+
                                                      data.Items[0].arriveStatus+' '+data.Items[0].arriveDate+'<br>'+
                                                      '<div style="padding:10px 0;line-height: 25px">'+
                                                        '<h4>Tracking History:</h4>'+
                                                        data.Items[0].arriveDate+'<br>'+
                                                        'Luggage at '+data.Items[0].arriveStatus+'<br><br>'+
                                                        '<hr style="border-top: dotted 4px;color:#999;" />'+
                                                        data.Items[0].transitDate+'<br>'+
                                                        'On its way to '+data.Items[0].transitStatus+'<br>'+
                                                        '<hr style="border-top: dotted 4px;color:#999;" />'+
                                                        data.Items[0].departureDate+'<br>'+
                                                        data.Items[0].departureStatus+'<br>'+
                                                      '</div>'+
                                                  '</td>'+
                                              '</tr>'+
                                          '</table>'+
                                      '</td>'+
                                  '</tr>'+
                                  '</table>'+
                      '</body>'
            };
            sgMail.send(msg);
        }

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