module.exports.emailTemplate = () => {
	return {
		html: '<head>'+
                      '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'+
                      '<title>A Simple Responsive HTML Email</title>'+
                          '<style type="text/css">'+
                          '@import url("https://fonts.googleapis.com/css?family=Oswald");'+
                          'body {margin: 0; padding: 0; min-width: 100%!important;}'+
                          '.content {width: 100%; max-width: 600px;}'+
                          '@media only screen and (min-device-width: 601px) {'+
                          '.content {width: 600px !important;}'+
                          '}'+
                          '.header {padding: 40px 30px 20px 30px;}'+
                          '.col425 {width: 425px!important;}'+
                          '.subhead {font-size: 15px; color: #ffffff; font-family: sans-serif; letter-spacing: 5px;}'+
                          '.h1 {font-size: 40px; line-height: 38px; font-weight: bold;}'+
                          '.header .h1, .header .h2, .header .bodycopy {color: #e8ef09; font-family: "Oswald", sans-serif;}'+
                          '.innerpadding {padding: 30px 30px 30px 30px;}'+
                          '.borderbottom {border-bottom: 1px solid #f2eeed;}'+
                          '.h2 {padding: 0 0 15px 0; font-size: 24px; line-height: 28px; font-weight: bold;font-family: "Oswald", sans-serif;}'+
                          '.bodycopy {font-size: 16px; line-height: 22px;font-family: "Oswald", sans-serif;}'+
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
                                                      'data.Items[0].trackingNumber<br>'+
                                                      '<img src="https://s3-us-west-1.amazonaws.com/luggageteleport.net/img/tracking_pick.png"  width="377" height="auto"/>'+
                                                      'Expected Delivery Day : data.Items[0].expectedDeliveryDate<br>'+
                                                      'Luggage has been picked up and is waiting for the next available truck<br>'+
                                                      '<div style="padding:10px 0;line-height: 25px">'+
                                                      '<h4>Tracking History:</h4>'+
                                                      'data.Items[0].departureDate<br>'+
                                                      'data.Items[0].departureStatus<br>'+
                                                      '<hr style="border-top: dotted 4px;color:#999;" />'+
                                                      'data.Items[0].departureDate<br>'+
                                                      'data.Items[0].departureStatus<br>'+
                                                      '</div>'+
                                                  '</td>'+
                                              '</tr>'+
                                          '</table>'+
                                      '</td>'+
                                  '</tr>'+
                                  '</table>'+
                      '</body>'
	};
}