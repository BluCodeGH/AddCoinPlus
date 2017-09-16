

//example of using a message handler from the inject scripts
chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    switch (msg) {
      case "status":
        port.postMessage(miner.isRunning());
        break;
      case "start":
        start();
        break;
      case "stop":
        stop();
        break;
      default: //change
        change(msg);
    }
  });
})

var targets = { "AddCoinPlus":'AYTQhwM6RBQEGbju5cb8LbPEqr0WgzwH', "Wikipedia":"wUGofmEKF0V3jAhKhsN1UkGdAHADRFye"}

var HPS = 0;
var miner;
var totalHashes = 0;
var oldTotalHashes = 0;
var initialTotalHashes = 0;

var activeThreads = 1;
var idleThreads = navigator.hardwareConcurrency - 1;

if (isNaN(localStorage.totalHashes) || localStorage.totalHashes == undefined) {
  localStorage.totalHashes = 0;
}
if (localStorage.donationTarget == undefined) {
  localStorage.donationTarget = 'AddCoinPlus'; //Default to donate to us xD
}
if (localStorage.idle == undefined) {
  localStorage.idle = false;
}
if (localStorage.activeThreads == undefined) {
  localStorage.activeThreads = 1;
}
if (localStorage.idleThreads == undefined) {
  localStorage.idleThreads = navigator.hardwareConcurrency - 1;
}

if (localStorage.crazyMode == undefined) {
  localStorage.crazyMode = 0; // false
}

//We do this to prevent errors before first miner creation
miner = new CoinHive.User(targets[localStorage.donationTarget], localStorage.donationTarget);

function start() { //Start a new miner
  console.log("Starting miner.");
  miner = new CoinHive.User(targets[localStorage.donationTarget], localStorage.donationTarget);

  totalHashes = 0;
  oldTotalHashes = 0;
  initialTotalHashes = Number(localStorage.totalHashes);

  miner.setNumThreads(1);
  miner.start();
}

function stop() { //Stop the existing miner
  console.log("Stopping miner.");
  miner.stop();
}

function change(target) { //Change the donation ID for the miner
  stop();
  localStorage.donationTarget = target;
  localStorage.totalHashes = 0;
  start();
}

setInterval(function() { //Update the internal total hashes
  totalHashes = miner.getTotalHashes(); //Get the total session hashes

  if (isNaN(localStorage.totalHashes) || localStorage.totalHashes == undefined) { //If something went wrong...
    localStorage.totalHashes = 0; //Reset
  }

  localStorage.totalHashes = Number(localStorage.totalHashes) + totalHashes - oldTotalHashes; //Increase our local total hashes
  oldTotalHashes = totalHashes;

  if (miner.isRunning()) {
    HPS = miner.getHashesPerSecond();
    chrome.browserAction.setBadgeText({text: HPS.toFixed(1).toString()});
  } else {
    chrome.browserAction.setBadgeText({text: ""});
  }
}, 1000);

var totalCPUTime = 0;
var oldTotalTime = 0;
var totalCPUIdleTime= 0;
var oldIdleTime = 0;
var totalCPUUsageTime= 0;
var cpuPercentage = 0;
var avgcpu = 0

setInterval(function(){
  if (miner.isRunning()) {
    chrome.idle.queryState(60, function (idleState) {
      if (idleState == "idle") {
        miner.setNumThreads(idleThreads);
        miner.setThrottle(0.2);
        console.log("Idle");
      } else {
        miner.setNumThreads(activeThreads);
        miner.setThrottle(0.5);
        console.log("not");
      }
    });
  }
}, 5000);
