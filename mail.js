// Mail Composing Middleware
// Created for MIO server | www.MakeItOnce.net
// Author: Julius Gromyko | juliusgromyko@gmail.com
// Julius Gromyko (C) 2017

var fs = require("fs");
var path = require("path");
var vash = require("vash");
var mailcomposer = require('mailcomposer');
var _ = require('lodash');

// Base dirs
var templatesPath = path.join(require('path').dirname(require.main.filename),'views','emails');
var assetsPath = path.join(templatesPath, 'assets');
var publicImagesPath = path.join(require('path').dirname(require.main.filename), 'public');
var defaultSender = 'Sara and Friends <noreply@example.com>';
var defaultsubject = 'Update from Example.com';

// Middleware Constructor
function init(options){
  if(options){
    if(options.templatesPath){
      templatesPath = path.join(require('path').dirname(require.main.filename),options.templatesPath);
      assetsPath = path.join(templatesPath, 'assets');
    };

    if(options.assetsPath){
      assetsPath = path.join(templatesPath, options.assetsPath);
    };

    if(options.publicImagesPath){
      publicImagesPath = path.join(require('path').dirname(require.main.filename), options.publicImagesPath);
    };

    if(options.defaultsubject){
      defaultsubject = options.defaultsubject;
    };

    if(options.defaultsubject){
      defaultsubject = options.defaultsubject;
    }
  };

  return {
    composeText: composeText,
    composeTemplate: composeTemplate
  };
};

// Send Static Text
function composeText(to, body, options){
  var data = {
    from: defaultSender,
    to: to,
    subject: defaultsubject,
    text: body
  };

  if(options){
    if(options.from){
      data.from = options.from;
    };
    if(options.subject){
      data.subject = options.subject;
    };
  };

  return data;
};

// Send Template with Attachments
function composeTemplate(to, templateName, fields, callback){
  var _rawTemplate = fs.readFileSync(path.join(templatesPath, templateName)+".json");
  if(!_rawTemplate){
    return callback("no such template", null);
  };
  var templateSettings = JSON.parse(_rawTemplate);
  if(!templateSettings.template){
    return callback("no html template file", null);
  };
  templateSettings.template = path.join(templatesPath, templateSettings.template);

  if(!Array.isArray(templateSettings.attachments)){
    templateSettings.attachments = [templateSettings.attachments];
  };
  templateSettings.attachments = templateSettings.attachments.map((attachment)=>{
    return {
      path: path.join(assetsPath, attachment),
      cid: attachment
    };
  });

  var _rawTemplateMarkUp = fs.readFileSync(templateSettings.template, {encoding: "utf8"});
  if(!_rawTemplateMarkUp){
    return callback("no html template or broken file", null);
  };
  var template = vash.compile(_rawTemplateMarkUp);

  if (fields.attachments && fields.attachments.length) {
    _.forIn(fields.attachments, (imgName) => {
      templateSettings.attachments.push({path:publicImagesPath + '/' + imgName, cid:imgName});
    });
  };

  var mail = mailcomposer({
    from: templateSettings.from || defaultSender,
    to: to,
    subject: templateSettings.subject || defaultsubject,
    html: template(fields || {}),
    attachments: templateSettings.attachments
  });

  mail.build(function(mailBuildError, message) {

    if(mailBuildError){
      return callback(mailBuildError, null);
    };
    callback(null, {
      to: to,
      message: message.toString('ascii')
    });
  });
};

module.exports=init;
