// client :
// push
// send req to get existing files
// get existing files
// compare list
// if no different : print you are now up to date bro
// else :
// copy differences to folder
// zip them
// delete folder
// upload to server
// show response


//server :
// when request comes in : get list of all directories
// send existing files list in the json format
// when upload file : extract file to folder
// copy contents that dos'nt exists yet to main folder
// delete zip and extracted folder

// when clone request comes in : zip all directory and sent it to user

const request = require('request');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

// for reading all files
const glob = require('glob');
let dirname = __dirname.split("\\").join("/") + '/';
// console.log("dir name  : "+dirname)
var getDirectories = function (src, callback) {
    glob(src + '/**/*.*', callback);
};


var repoName = process.argv[2];

request.get(`http://localhost:3000/files-list?repo=${repoName}`, function (err, res, body) {
    var serverData = JSON.parse(body);
    // console.log(`server data :`);
    // console.log(serverData);
    var localFiles = [];
    var jitData = glob.sync(path.join(__dirname, "/.JIT/") + "/**/*.*");
    jitData.forEach(item => {
        // console.log(item);
        // console.log(item.split(dirname)[1]);
        if (item.includes(".JIT/file.zip") || item.split(dirname)[1] === undefined || item.split(dirname)[1].startsWith("node_modules") === true || item.split(dirname)[1].startsWith("tmp_files_to_zip") === true) {

        } else {

            localFiles.push(item.split(dirname)[1]);
            // console.log(item.split(dirname)[1]);
        }
    });
    getDirectories(path.join(__dirname), function (err, res) {
            if (err) {
                // console.log('Error', err);
            } else {
                res.forEach(item => {
                    // console.log(item);
                    // console.log(item.split(dirname)[1]);
                    if (item.split(dirname)[1] === undefined || item.split(dirname)[1].startsWith("node_modules") === true || item.split(dirname)[1].startsWith("tmp_files_to_zip") === true) {

                    } else {

                        localFiles.push(item.split(dirname)[1]);
                        // console.log(item.split(dirname)[1]);
                    }
                });
                // console.log(localFiles);
                // check diffs
                // if in the current and not in the server should copy and push to server
                var pushedList = [];
                localFiles.forEach(it => {

                    if (!serverData.items.includes(it)) {
                        pushedList.push(it);
                    } else {
                        // console.log(`skip : ${it}`);
                    }
                });
                if (pushedList.length === 0) {
                    console.log("your project is sync to server! don't need to push it! ");
                    process.exit(0);
                }
                console.log("pushed list : ");
                console.log(pushedList);

                // process.exit(0);

                // copy file to directory
                fs.mkdirSync(__dirname + "/" + 'tmp_files_to_zip/', {recursive: true});
                pushedList.forEach(it => {
                    let newPath = (__dirname + "/" + 'tmp_files_to_zip/' + it).split("/");
                    newPath.pop();
                    if (fs.existsSync(newPath.join("\\")) === false) {
                        fs.mkdirSync(newPath.join("\\"), {recursive: true});
                    }
                    fs.copyFile(it, __dirname + "/" + 'tmp_files_to_zip/' + it, (err) => {
                        if (err) throw err;
                        // console.log('source.txt was copied to destination.txt');
                    });
                });

                //zip


                var output = fs.createWriteStream(__dirname + "/.JIT/file.zip");

                var archive = archiver('zip');

                output.on('close', async function () {
                    // console.log(archive.pointer() + ' total bytes');

                    const options = {
                        method: 'POST',
                        uri: "http://localhost:3000/upload-repo",
                        formData: {
                            file: fs.createReadStream(__dirname + "/.JIT/file.zip"),
                            repoName: repoName,


                        }
                    };
                    const json = await request(options);
                    // pushed to server
                    // console.log(json);
                    //delete folder and zip

                    fs.unlink(__dirname + "/.JIT/file.zip", (err) => {
                        // if (!err) {
                        //     console.log("completly gone");
                        // } else {
                        //     console.log(err);
                        // }
                    });

                    // delete a directory
                    fs.rmdir(__dirname + "/tmp_files_to_zip/", {recursive: true}, (err) => {
                        // if (err) {
                        //     throw err;
                        // }

                        // console.log(`$ is deleted!`);
                    });
                    console.log("pushed successfully to server ")


                });

                archive.on('error', function (err) {
                    throw err;
                });

                archive.pipe(output);


// append files from a sub-directory and naming it `new-subdir` within the archive (see docs for more options):
                archive.directory(__dirname + "/tmp_files_to_zip", false);
                archive.finalize();


            }
        }
    );

});


// zipping
//
// var archiver = require('archiver');
//
// var output = file_system.createWriteStream('target.zip');
// var archive = archiver('zip');
//
// output.on('close', function () {
//     console.log(archive.pointer() + ' total bytes');
//     console.log('archiver has been finalized and the output file descriptor has closed.');
// });
//
// archive.on('error', function(err){
//     throw err;
// });
//
// archive.pipe(output);
//
// // append files from a sub-directory and naming it `new-subdir` within the archive (see docs for more options):
// archive.directory(__dirname, false);
// archive.finalize();


//extract zip

// const extract = require('extract-zip')
//
// async function main () {
//     try {
//         await extract('target.zip', { dir: __dirname+"/"+"make-a-new" })
//         console.log('Extraction complete')
//     } catch (err) {
//         // handle any errors
//         console.log(err);
//     }
// }
//
// main();


// delete file
//
// file_system.unlink("./make-a-new/target.zip", (err) => {
//     if (!err) {
//         console.log("completly gone");
//     }else{
//         console.log(err);
//     }
// });

// delete a directory
// file_system.rmdir("./make-a-new/", { recursive: true }, (err) => {
//     if (err) {
//         throw err;
//     }
//
//     console.log(`$ is deleted!`);
// });

// copy file
// file_system.mkdirSync(__dirname+"/"+'this/is/a/path/',{recursive:true});
// file_system.copyFile('target.zip', __dirname+"/"+'this/is/a/path/name.zip', (err) => {
//     if (err) throw err;
//     console.log('source.txt was copied to destination.txt');
// });



