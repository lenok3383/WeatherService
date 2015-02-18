window.onload=function(){
    $.ajax({
        type: "GET",
        url: "/history/",
        success: function (data) {
            $("#history_div").html(history_json_as_table(data['history']));
        }
    });
    $.ajax({
        type: 'GET',
        url: "/weather/",
        success: function (data) {
            $("#parameter_div").html(data)
        }
    });
};