var gCurrentPage;
var gMaxPage;
var gHeadersHistory = ["City", "Date", "Services", "Urls"];
var gHeadersForecast = ["Location", "Minimal temperature", "Maximal temperature"];


function forecastById(id) {
    $("#spinner").css('display', 'block');
    $.ajax({
        type: 'GET',
        url: "/forecast/".concat(String(id), "/"),
        success: function (forecast) {
            cleanAllElementChild('forecast_table');
            createForecastTable(forecast);
            $("#spinner").css('display', 'none');
        },
        error: function(data){
            cleanAllElementChild('forecast_table');
            createForecastTable(data);
            $("#spinner").css('display', 'none');
        }
    });
}

function createForecastTable(data) {
    var forecast_div = document.getElementById("forecast_div");
    if (data.hasOwnProperty('error_msg')) {
        var error_div = document.getElementById('error_msg');
        var err = document.createElement('div');
        err.className = 'alert alert-danger';
        var txt = document.createTextNode(data['error_msg']);
        err.appendChild(txt);
        error_div.appendChild(err);
    } else {
        cleanAllElementChild("error_msg");
        var table = document.getElementById("forecast_table");

        var row = document.createElement("tr");
        table.appendChild(createTableHeader(gHeadersForecast));
        row.appendChild(fillTableCell_Text(data['city'] + data['country']));
        row.appendChild(fillTableCell_Text(data['min_temperature']));
        row.appendChild(fillTableCell_Text(data['max_temperature']));

        table.appendChild(row);
        table.className = "table table-striped";
    }
}

function historyJsonAsTable(data) {
    var table = document.getElementById("history_table");
    table.appendChild(createTableHeader(gHeadersHistory));
    $.each(data['history'], function() {
        var rows = document.createElement("tr");
        rows.appendChild(fillTableCell_Text(this['city']));
        rows.appendChild(fillTableCell_Text(this['forecast_day']));
        rows.appendChild(fillTableCell_Text(this['services_name']));
        rows.appendChild(fillTableCell_Urls(this['url']));
        table.appendChild(rows);
    });
}

function historyPagination(data){
    gCurrentPage = data['paginator']['current'];
    gMaxPage = data['paginator']['maxpage'];
    navi_menu = document.getElementById('pagination');

    var navi_button_next = document.createElement('li');
    navi_button_next.className = 'next';
    var next_page_url = document.createElement('a');
    next_page_url.onclick = nextPage;
    next_page_url.appendChild(document.createTextNode("Next"));
    navi_button_next.appendChild(next_page_url);

    var navi_status = document.createElement('span');
    navi_button_next.className = 'current';
    navi_status.appendChild(document.createTextNode("Page ".concat(gCurrentPage, ' of ', gMaxPage)));

    var navi_button_prev = document.createElement('li');
    navi_button_prev.className = 'previous';
    var prev_page_url = document.createElement('a');
    prev_page_url.onclick = prevPage;
    prev_page_url.appendChild(document.createTextNode("Prev"));
    navi_button_prev.appendChild(prev_page_url);

    if (gMaxPage <= 1) {
        navi_menu.appendText("No request yet");
    } else if (gCurrentPage <= 1) {
        navi_menu.appendChild(navi_status);
        navi_menu.appendChild(navi_button_next);
    } else if (gCurrentPage >= gMaxPage) {
        navi_menu.appendChild(navi_status);
        navi_menu.appendChild(navi_button_prev);
    } else {
        navi_menu.appendChild(navi_button_prev);
        navi_menu.appendChild(navi_status);
        navi_menu.appendChild(navi_button_next);
    }
}

function cleanAllElementChild(element_id){
    var element = document.getElementById(String(element_id));
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function createTableHeader(headers){
    var tr = document.createElement("tr");
    for (var i = 0; i < headers.length; i++){
        var th = document.createElement("th");
        var txt = document.createTextNode(headers[i]);
        th.appendChild(txt);
        tr.appendChild(th);
    }
    return tr;
}

function fillTableCell_Text(cellData){
    var td = document.createElement("td");
    var txt = document.createTextNode(String(cellData));
    td.appendChild(txt);
    return td;
}

function fillTableCell_Urls(data) {
    var td = document.createElement("td");
    var elementA = document.createElement("a");
    var txt = document.createTextNode('check');
    elementA.onclick = function() {forecastById(data)};
    elementA.appendChild(txt);
    td.appendChild(elementA);
    return td;
}

function nextPage(){
    $.ajax({
        type: 'GET',
        url: '/history/',
        data: {page: (gCurrentPage + 1)},
        success: function (data) {
            cleanAllElementChild('history_table');
            historyJsonAsTable(data);
            cleanAllElementChild('pagination');
            historyPagination(data);
        }
    });
}

function prevPage(){
    $.ajax({
        type: 'GET',
        url: '/history/',
        data: {page: (gCurrentPage - 1)},
        success: function (data) {
            cleanAllElementChild('history_table');
            historyJsonAsTable(data);
            cleanAllElementChild('pagination');
            historyPagination(data);
            }
    });
}
