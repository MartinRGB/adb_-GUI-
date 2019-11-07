// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const childProcess = require('child_process');
const exec = childProcess.exec;
const { app } = window.require('electron').remote;
const {dialog} = require('electron').remote;

const adbPath = app.getAppPath() + '/assets/';
const videoInput = document.getElementById('video_name');

var folderForVideo;
var videoName = videoInput.value;


function hideStatusNav(){
    execCMD(adbPath + 'adb shell settings put global policy_control immersive.status=*',"进入沉浸模式");
}

function showStatusNav(){
    execCMD(adbPath + 'adb shell settings put global policy_control null*',"回到正常模式");
}

function startRecord(){
    execCMD(adbPath + 'adb shell screenrecord /sdcard/'+videoName+'.mp4',"完成录制");
}

function getScreenRecordPID(){
    execCMD(adbPath + 'adb shell pidof screenrecord',"获取录屏 PID");
}

function stopRecord(){


    exec(adbPath + 'adb shell pidof screenrecord', function(error, stdout, stderr){
        if(error) {
            console.error('error: ' + error);
            return;
        }

        exec(adbPath + 'adb shell kill -2 ' + stdout, function(error, stdout, stderr){
            if(error) {
                console.error('error: ' + error);
                return;
            }

            setTimeout(function() {
                if(folderForVideo!=null){
                    execCMD(adbPath + 'adb pull /sdcard/'+videoName+'.mp4 ' + folderForVideo,"保存录制");
                }
                else{
                    execCMD(adbPath + 'adb pull /sdcard/'+videoName+'.mp4 ~' ,"保存录制");
                }
            }, 300);
        });
    });
    
}

function installSelectedAPK(){

    let options = {properties:["openFile"]}
    var path = dialog.showOpenDialog(options); 
    path.then(function (result) {
        var apkPath = result.filePaths;

        execCMD(adbPath + 'adb shell setprop debug.allow.persist.update true','安装准备',execCMD(adbPath + 'adb install -r ' + apkPath,'安装成功',null))
    
    });


}

function restart(){
    execCMD(adbPath + 'adb reboot','重启');
}

// TODO:MOVE to MainProcess & import to use

function changeVideoName(event){
    videoName = event.target.value;
    console.log("Changed file name to : " + event.target.value);
}



function selectFiles() {
    let options = {properties:["openFile"]}
    var path = dialog.showOpenDialog(options); 
    path.then(function (result) {
         
         folderForVideo = result.filePaths;
         console.log(result.filePaths)
    });
}

function selectDirectory() {
    let options = {properties:["openDirectory","treatPackageAsDirectory"]}
    var path = dialog.showOpenDialog(options); 
    path.then(function (result) {
         //console.log(result.filePaths)
         folderForVideo = result.filePaths;
         console.log(result.filePaths)
    });
}

// CMD
function execCMD(cmd,log,callback){
    exec(cmd, function(error, stdout, stderr){
        if(error) {
            console.error('error: ' + error);
            return;
        }
        console.log(log + ':\n' + stdout);
        callback;
    });
}



