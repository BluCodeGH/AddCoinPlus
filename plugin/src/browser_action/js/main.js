$(document).ready(function(){
var port = chrome.extension.connect({
  name: "Sample Communication"
});

setInterval(function () {
  if (localStorage.crazyMode == "true") {
    $("#mainPopup").css("background-color", function () {
        this.switch = !this.switch
        return this.switch ? "orange" : "#FFC107"
    }, 100);
  } else {
    $("#mainPopup").css("background-color", "white");
  }
});
// GO CRAZY MODE!
$("#goCrazy").click(function(){
  if (localStorage.crazyMode == "false") {
    console.log("Go Crazy!");
    localStorage.crazyMode = true;
    $("#goCrazyContainer").css("color", "black");
  } else {
    console.log("Calm down...");
    localStorage.crazyMode = false;
    $("#goCrazyContainer").css("color", "orange");
  }
});


$('[data-toggle="tooltip"]').tooltip();

var bg = chrome.extension.getBackgroundPage();

var maxThreads = navigator.hardwareConcurrency;

$("#threads-plus").click(function(){
  if ( parseInt($("#threads").text()) < maxThreads ) {
    $("#threads").text( parseInt(localStorage.activeThreads) + 1 );
    localStorage.activeThreads = $("#threads").text();
    bg.activeThreads = localStorage.activeThreads;
  }
})

$("#threads-minus").click(function(){
  if ( parseInt($("#threads").text()) > 1) {
    $("#threads").text( parseInt(localStorage.activeThreads) - 1 );
    localStorage.activeThreads = $("#threads").text();
    bg.activeThreads = localStorage.activeThreads;
  }
})

$("#threads-plus-2").click(function(){
  if ( parseInt($("#threads2").text()) < maxThreads ) {
    $("#threads2").text( parseInt(localStorage.idleThreads) + 1 );
    localStorage.idleThreads = $("#threads2").text();
    bg.idleThreads = localStorage.idleThreads;
  }
})

$("#threads-minus-2").click(function(){
  if ( parseInt($("#threads2").text()) > 1) {
    $("#threads2").text( parseInt(localStorage.idleThreads) - 1 );
    localStorage.idleThreads = $("#threads2").text();
    bg.idleThreads = localStorage.idleThreads;
  }
})

$("#threads").text(parseInt(localStorage.activeThreads));
$("#threads2").text(parseInt(localStorage.idleThreads));

port.onMessage.addListener(function(msg) {
  if (msg == true) {
    $("#action-button").removeClass('btn-success');
    $("#action-button").addClass('btn-warning');
    $("#action-button").text("Stop");
  } else {
    $("#action-button").addClass('btn-success');
    $("#action-button").removeClass('btn-warning');
    $("#action-button").text("Start");
  }
});

port.postMessage("status");


$("#dropdown-title").text(localStorage.donationTarget);
$(".dropdown-option").click(function(){
  var clickedText = $(this).text()
  console.log(clickedText);
  port.postMessage(clickedText);
  $("#dropdown-title").text(clickedText)
});
$("#action-button").click(function(){
  if ($(this).hasClass('btn-success')) {
    // CLICK TO STOP
    $(this).removeClass('btn-success');
    $(this).addClass('btn-warning');
    $(this).text("Stop");
    port.postMessage("start");
  } else {
    // CLICK TO START AGAIN
    $(this).removeClass('btn-warning');
    $(this).addClass('btn-success');
    $(this).text("Start");
    port.postMessage("stop");
  }
})

var totalHashes;
var HPS;

HPS = bg.miner.getHashesPerSecond();
$("#hps").text(HPS.toFixed(1));

setInterval(function() { //Update UI
  totalHashes = bg.miner.getTotalHashes(true);

  $("#total").text(bg.initialTotalHashes + totalHashes);
  $("#session").text(totalHashes);
}, 100)

setInterval(function() { //Update UI
  HPS = bg.miner.getHashesPerSecond();

  $("#hps").text(HPS.toFixed(1));
}, 1000);

$.getJSON("https://addcoinplus-server.herokuapp.com/number", {name:localStorage.donationTarget}, function(json) {
  $("#twitter").attr("href", "https://twitter.com/intent/tweet?text=I have helped donate $" + json.TotalMoney.toFixed(2) + " to " + localStorage.donationTarget + " by having a computer! You can too by installing Addcoin Plus in your browser.")
});
setInterval(function() {
  $.getJSON("https://addcoinplus-server.herokuapp.com/number", {name:localStorage.donationTarget}, function(json) {
    $("#twitter").attr("href", "https://twitter.com/intent/tweet?text=I have helped donate $" + json.TotalMoney.toFixed(2) + " to " + localStorage.donationTarget + " by having a computer! You can too by installing Addcoin Plus in your browser.")
  });
}, 10000)

});
