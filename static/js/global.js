function forecast_by_id(id){
    $("#spinner").css('display', 'block');
    $.ajax({
        type: 'GET',
        url: "/forecast/".concat(String(id), "/"),
        success: function (forecast)
        {
            $("#forecast_div").html(forecast_json_as_table(forecast));
            $("#spinner").css('display', 'none');
        },
        error: function(data){
            $("#forecast_div").html(forecast_json_as_table(data));
            $("#spinner").css('display', 'none');
        }
    });
}

function forecast_json_as_table(data){
    if (data.hasOwnProperty('error_msg')){
        return $("<div></div>").addClass('alert alert-danger').text(data['error_msg'])
    }
        var table = $('<table></table>').addClass("table table-striped");
        table.append("<tr><th>Location</th><th>Minimal temperature </th><th>Maximal temperature </th></tr>");
        table.append('<tr><td>city <b>'.concat(data['city'], '</b> country <b>', data['country'], '</b></td><td>', +data['min_temperature'] + '</td><td>' + data['max_temperature'] + '</td></tr>'));
        return table;
}

function history_json_as_table(data){
    var table = $('<table></table>').addClass("table table-striped");
    table.append("<tr><th>City</th><th>Date</th><th>Services</th><th>Urls</th></tr>");
    $.each(data, function() {
        table.append("<tr><td>"+ this.city+"</td><td>"+ this.forecast_day +"</td><td>"+ this.services_name + "</td><td><a onclick='forecast_by_id("+ this.url +")'>check</a></td></tr>");
    });
    return table;
}