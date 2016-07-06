'use strict';
var fs = require('fs'),
    formidable = require('formidable'),
    path = require('path'),
    Promise = require('bluebird'),
    slugify = require('slug'),
    knex = require('./db/knex');
    // alter = require('imagemagick');

function Bills() {
    return knex('bills');
}

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'mukipayz',
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});


const UPLOAD_DIR =  path.resolve(__dirname, "./public/uploads");


var uploader = {
    upload: function(request) {
        return new Promise(function(resolve, reject) {
            //check if uploads dir exists
            fs.lstat(UPLOAD_DIR, function(err, stats) {
                if (!err) {
                    if (stats.isDirectory()) {
                        doUpload(request);
                    } else {
                        createDir(doUpload);
                    }
                } else {
                    createDir(doUpload);
                }
            });

            function createDir(callback) {
                fs.mkdir(UPLOAD_DIR, function() {
                    return callback(request);
                });
            }

            function doUpload(request) {
                //form setup
                var form = new formidable.IncomingForm();
                    form.uploadDir = UPLOAD_DIR;
                    form.keepExtensions = true;

                form.on('end', function() {
                    // console.log("this: ", this);
                    var image_path = path.resolve(__dirname, "./public/uploads/"+this.openedFiles[0].name);
                    // console.log("this: ", this);
                    fs.rename(this.openedFiles[0].path, image_path, function(err) {
                        if (err) {reject(err);}
                    });
                });
                form.parse(request, function (err, fields, files) {
                    files = files.files;
                    // console.log("fields: ", fields);
                    // console.log("files??: ", files);
                    console.log("files.name: ", files.name.substring(0, files.name.indexOf('.')));
                    var ext = files.name.substring(files.name.indexOf('.'), files.name.length);
                    var title;
                    if (files.name < 1) {
                        var name = files.name.substring(0, files.name.indexOf('.'));
                        title = slugify(name, '_').toLowerCase();
                    } else {
                        title = slugify(fields.title, '_').toLowerCase();
                    }
                    var newPath = path.resolve(__dirname, "./public/uploads/"+title+ext);
                    fs.rename(UPLOAD_DIR+"/"+files.name, newPath, function(err) {
                        if (err) {reject(err);}
                    });
                    resolve({
                        image: {
                            fullpath: newPath,
                            type: ext,
                            file: title+ext,
                            name: fields.title
                        },
                        formData: fields
                    });
                });
            }
        });
    },
    toCloud: function(filename) {
        return new Promise(function(resolve, reject) {
            cloudinary.uploader.upload(UPLOAD_DIR + "/" + filename, function(result) {
                resolve(result);
            }).catch(reject);
        });
    },
    toDatabase: function(data) {
        return new Promise(function(resolve, reject) {
            console.log("data upload: ", data.upload);
            Bills().insert({
                title: data.upload.formData.title || '',
                amount: data.upload.formData.amount || 0,
                group_id: data.upload.group_id,
                image_url: data.cloud.url
            }).then(resolve).catch(reject);
        });
    },
    removeFromFile: function(data) {
        return new Promise(function(resolve, reject) {
            //remove file from uploads
        });
    }
};



module.exports = uploader;
