var express = require('express');
var router = express.Router();
const fs = require('fs');
const glob = require('glob');
const path = require('path');

router.get('/', function (req, response, next) {
    let files = {items: []};
    let mainFolder = req.query.repo;
    const result = [];
    const arr = __dirname.split("\\").join("/").split("/");
    arr.pop();
    let dirname = arr.join("/") + '/repos/' + mainFolder + "/";
    console.log(dirname);
    const getDirectories = function (src, callback) {
        glob(src + '/**/*.*', callback);
    };
    var jitData = glob.sync(path.join(dirname, ".JIT/") + "/**/*.*");
    jitData.forEach(item => {
        // console.log(item);
        // console.log(item.split(dirname)[1]);
        if (item.includes(".JIT/file.zip") || item.split(dirname)[1] === undefined || item.split(dirname)[1].startsWith("node_modules") === true || item.split(dirname)[1].startsWith("tmp_files_to_zip") === true) {

        } else {

            const entry = item.split(dirname)[1];
            files.items.push(entry);
            // console.log(item.split(dirname)[1]);
        }
    });

    getDirectories(dirname, function (err, res) {
        if (err) {
            console.log('Error', err);
            return [];
        } else {
            // res.forEach(item => {
            // });
            for (let i = 0 ; i< res.length;i++){
                const entry = res[i].split(dirname)[1];
                files.items.push(entry);

            }
            console.log(result);
            response.json(files);
        }
    });

});

module.exports = router;
