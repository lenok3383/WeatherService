function forecast_by_id(id){
    $.ajax({
        type: 'GET',
        url: "/forecast/".concat(String(id), "/"),
        success: function (forecast)
        {
            $("#forecast_div").html(forecast);
        }
    });
}