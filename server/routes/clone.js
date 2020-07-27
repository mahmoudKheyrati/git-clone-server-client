var express = require('express');
var router = express.Router();
var archiver = require('archiver');
var fs = require('fs');
var path = require('path');

/* GET users listing. */
router.get('/', async function (req, res, next) {
    const repoName = req.query.repoName;
    console.log(repoName);


    var repoPath = __dirname.split("\\");
    repoPath.pop();
    var output = fs.createWriteStream(`${repoPath.join("/")}/public/cloneFiles/${repoName}.zip`);

    var archive = archiver('zip');

    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');


    res.sendFile(path.join(__dirname,`../public/cloneFiles/${repoName}.zip`));

    });

    archive.on('error', function (err) {
        throw err;
    });

    await archive.pipe(output);

    var repoDir = repoPath.join("/") + `/repos/${repoName}/`;
    console.log(repoDir);

// append files from a sub-directory and naming it `new-subdir` within the archive (see docs for more options):
    await archive.directory(repoDir, false);
    await archive.finalize();

});

module.exports = router;
