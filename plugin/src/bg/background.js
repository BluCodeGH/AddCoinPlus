

//example of using a message handler from the inject scripts
chrome.extension.onConnect.addListener(function(port) {
  console.log("Connected .....");
  port.onMessage.addListener(function(msg) {
    console.log("message recieved: " + msg);
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

if (isNaN(localStorage.totalHashes) || localStorage.totalHashes == undefined) {
  localStorage.totalHashes = 0;
}
if (localStorage.donationTarget == undefined) {
  localStorage.donationTarget = 'AddCoinPlus'; //Default to donate to us xD
}
if (localStorage.idle == undefined) {
  localStorage.idle = false;
}

//We do this to prevent errors before first miner creation
miner = new CoinHive.User(targets[localStorage.donationTarget], localStorage.donationTarget); 

function start() { //Start a new miner
  console.log("Starting miner.");
  miner = new CoinHive.User(targets[localStorage.donationTarget], localStorage.donationTarget);

  totalHashes = 0;
  oldTotalHashes = 0;
  initialTotalHashes = Number(localStorage.totalHashes);

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
}, 1000);

var totalCPUTime = 0;
var oldTotalTime = 0;
var totalCPUIdleTime= 0;
var oldIdleTime = 0;
var totalCPUUsageTime= 0;
var cpuPercentage = 0;
var avgcpu = 0

setInterval(function(){
  if (miner.isRunning() && localStorage.idle == "false") {
    chrome.system.cpu.getInfo(function(info){
      info.processors.forEach(function(processor){
        var usage = processor.usage;
        totalCPUTime += usage.total;
        totalCPUIdleTime += usage.idle;
      })
      totalCPUTime -= oldTotalTime;
      oldTotalTime += totalCPUTime;
      totalCPUIdleTime -= oldIdleTime;
      oldIdleTime += totalCPUIdleTime
      totalCPUUsageTime = totalCPUTime - totalCPUIdleTime;
      cpuPercentage = totalCPUUsageTime/totalCPUTime*100
      if (avgcpu == 0) {
        avgcpu = cpuPercentage;
      } else {
        avgcpu = 0.8 * avgcpu + 0.2 * cpuPercentage;
      }
      console.log(avgcpu);
      if (avgcpu > 50 && miner.getThrottle() < 1) {
        miner.setThrottle(miner.getThrottle() + 0.2);
      } else if (avgcpu < 30 && miner.getThrottle() > 0.00) {
        miner.setThrottle(miner.getThrottle() - 0.2);
      }
      console.log(miner.getThrottle());
    })
  }
}, 500);

chrome.idle.onStateChanged.addListener(function (idleState) {
  if (idleState == "idle") {
    miner.setThrottle(0.2);
    console.log("Idle");
  } else {
    miner.setThrottle(0.8);
    console.log("not");
  }
});
