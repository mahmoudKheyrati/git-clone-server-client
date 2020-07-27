var express = require('express');
var router = express.Router();
const fs = require('fs');
const extract = require('extract-zip');
const path = require('path');
const glob = require('glob');


var getDirectories = function (src, callback) {
  glob(src + '/**/*.*', callback);
};
let dirname = 'C:/Users/lolip/Desktop/node/server/extractFolder/';

console.log(__dirname)
router.post('/', async function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.file;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(`./tmp/${req.body.repoName}.zip`, async function (err) {
        if (err)
            return res.status(500).send(err);

        // res.send('File uploaded!');
        try {
            await extract(`./tmp/${req.body.repoName}.zip`, {dir: path.join(__dirname, `../extractFolder/${req.body.repoName}/`)});
            // merge :
            fs.mkdirSync(`C:/Users/lolip/Desktop/node/server/repos/${req.body.repoName}`, {recursive: true});
            console.log("foldre create   "+__dirname, `../extractFolder/${req.body.repoName}/`);



            var pushedList = [];
            var jitData = glob.sync(path.join(__dirname, `../extractFolder/${req.body.repoName}/.JIT/`) + "/**/*.*");
            jitData.forEach(item => {
                // console.log(`jit : ${item}`);
                // console.log(item);
                // console.log(item.split(dirname)[1]);
                if (item.includes(".JIT/file.zip") || item.split(dirname)[1] === undefined || item.split(dirname)[1].startsWith("node_modules") === true || item.split(dirname)[1].startsWith("tmp_files_to_zip") === true) {
                    // console.log("ignore");
                } else {
                    // console.log("ckeck");

                    pushedList.push(item.split(dirname)[1]);
                    // console.log(item.split(dirname)[1]);
                    let newPath = ("C:/Users/lolip/Desktop/node/server/repos/" + req.body.repoName+item.split(dirname+req.body.repoName)[1]).split("/");
                    newPath.pop();
                    if (fs.existsSync(newPath.join("/")) === false) {
                        fs.mkdirSync(newPath.join("/"),{recursive:true});
                    }
                    const source = dirname+req.body.repoName+item.split(dirname+req.body.repoName)[1];
                    const destination ="C:/Users/lolip/Desktop/node/server/repos/" + req.body.repoName+item.split(dirname+req.body.repoName)[1];

                    fs.copyFile(source, destination, (err) => {
                        if (err) throw err;
                        // console.log('source.txt was copied to destination.txt');
                    });
                }
            });
            // console.log("jit data");
            // console.log(pushedList);

            getDirectories(path.join(__dirname, `../extractFolder/${req.body.repoName}/`), function (err, res) {
                if (err) {
                    // console.log('Error', err);
                } else {
                    res.forEach(item => {
                      pushedList.push(item.split(dirname)[1]);
                        // console.log("------"+req.body.repoName);
                        // console.log("***** "+item.split(dirname+req.body.repoName)[1]);
                        let newPath = ("C:/Users/lolip/Desktop/node/server/repos/" + req.body.repoName+item.split(dirname+req.body.repoName)[1]).split("/");
                        newPath.pop();
                        if (fs.existsSync(newPath.join("/")) === false) {
                            fs.mkdirSync(newPath.join("/"),{recursive:true});
                        }
                        const source = dirname+req.body.repoName+item.split(dirname+req.body.repoName)[1];
                        const destination ="C:/Users/lolip/Desktop/node/server/repos/" + req.body.repoName+item.split(dirname+req.body.repoName)[1];

                        fs.copyFile(source, destination, (err) => {
                                    if (err) throw err;
                                    // console.log('source.txt was copied to destination.txt');
                            });
                    });
                }
            });

            // pushedList.forEach(it => {
            //     fs.copyFile(it, path.join(__dirname, `../extractFolder/${req.body.repoName}/`) + it, (err) => {
            //         // if (err) throw err;
            //         // console.log('source.txt was copied to destination.txt');
            //     });
            // });
            // console.log('Extraction complete')

            res.send("ok");

        } catch (err) {
            // handle any errors
            console.log(err);
        }


    });
});

module.exports = router;
