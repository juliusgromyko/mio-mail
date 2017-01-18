# MIO Mail Middleware

Mail middleware for Node.js composing.

# Quick Start

1) Clong config, template and assets of demo Mail
2) Generate Mail
3) Send with your mail gateway. We are prefering mailgun

# Sample
var mailgun = require('mailgun-js')({apiKey: "YOUR_API_KEY", domain: "example.com"});
var mailer = require('mio-mail')({defaultSender: "Sample <noreply@example.com>"});

// Text Sample
var data  = mailer.composeText("sendTo@example.com","Sample Demo Mail");
mailgun.messages().send(data, (error, body)=> {
  console.log(error?error:body);
});

// MIME Sample
mailer.composeTemplate("sendTo@example.com", "demo", {name: "TEST_NAME"}, (err, data)=>{
  mailgun.messages().sendMime(data, (error, body)=> {
    console.log(error?error:body);
  });
});
