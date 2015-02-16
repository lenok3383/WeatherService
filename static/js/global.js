function forecast_by_id(id){
    $("#spinner").css('display', 'block');
    $.ajax({
        type: 'GET',
        url: "/forecast/".concat(String(id), "/"),
        success: function (forecast)
        {
            $("#forecast_div").html(forecast);
            $("#spinner").css('display', 'none');
        },
        error: function(data){
            $("#spinner").css('display', 'none');
        }
    });
}