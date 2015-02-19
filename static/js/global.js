var current_page;
var max_page;

function forecast_by_id(id){
    $("#spinner").css('display', 'block');
    $.ajax({
        type: 'GET',
        url: "/forecast/".concat(String(id), "/"),
        success: function (forecast) {
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
    var div = $("<div></div>").append("");
    var table = $('<table></table>').addClass("table table-striped");
    table.append("<tr><th>Location</th><th>Minimal temperature</th><th>Maximal temperature</th></tr>");
    table.append('<tr><td>city <b>'.concat(data['city'], '</b> country <b>',
                data['country'], '</b></td><td>', data['min_temperature'],
                '</td><td>',data['max_temperature'],'</td></tr>'));
    return table;
}

function history_json_as_table(data){
    current_page = data['paginator']['current'];
    max_page = data['paginator']['maxpage'];
    var div_history = $('<div></div>').append("<h3>History</h3>");
    var table = $('<table></table>').addClass("table table-striped");
    var navi_menu = $('<ul></ul>').addClass('pager');
    var navi_button_next = $('<li></li>').addClass('next');
    var navi_button_prev = $('<li></li>').addClass('previous');
    var navi_status = $('<span></span>').addClass('current').text("Page ".concat(current_page,' of ', max_page));
    table.append("<tr><th>City</th><th>Date</th><th>Services</th><th>Urls</th></tr>");
    $.each(data['history'], function() {
        table.append("<tr><td>".concat(this['city'], "</td><td>", this['forecast_day'],
            "</td><td>", this['services_name'], "</td><td><a onclick='forecast_by_id(",
            this['url'], ")'>check</a></td></tr>"));
    });
    if (max_page <= 1){
    } else if (current_page <= 1){
        navi_menu.append(navi_status);
        navi_menu.append(navi_button_next.append("<a onclick='nextPage()'>Next</a>"));
    } else if (current_page >= max_page){
        navi_menu.append(navi_status);
        navi_menu.append(navi_button_prev.append("<a onclick='prevPage()'>Previous</a>"));
    } else {
        navi_menu.append(navi_button_prev.append("<a onclick='prevPage()'>Previous</a>"));
        navi_menu.append(navi_status);
        navi_menu.append(navi_button_next.append("<a onclick='nextPage()'>Next</a>"));
    }
    div_history.append(table);
    div_history.append(navi_menu);
    return div_history;
}

function nextPage(){
    $.ajax({
        type: 'GET',
        url: '/history/',
        data: {page: (current_page + 1)},
        success: function (data) {
            $("#history_div").html(history_json_as_table(data))
        }
    });
}

function prevPage(){
    $.ajax({
        type: 'GET',
        url: '/history/',
        data: {page: (current_page - 1)},
        success: function (data) {
            $("#history_div").html(history_json_as_table(data));
            }
    });
}
