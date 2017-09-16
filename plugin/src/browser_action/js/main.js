$(document).ready(function(){
    $(".dropdown-option").click(function(){
        var clickedText = $(this).text()
        console.log(clickedText);
        $("#dropdown-title").text(clickedText)
    });
    $("#action-button").click(function(){
      if ($(this).hasClass('btn-success')) {
        // CLICK TO STOP
        $(this).removeClass('btn-success');
        $(this).addClass('btn-warning');
        $(this).text("Stop")
      } else {
        // CLICK TO START AGAIN
        $(this).removeClass('btn-warning');
        $(this).addClass('btn-success');
        $(this).text("Start");
      }
    })
});
