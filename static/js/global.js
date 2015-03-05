function  fillTableCell_Text (cellData) {
    var td = document.createElement("td");
    var txt = document.createTextNode(cellData);
    td.appendChild(txt);
    return td;
}

function Forecast() {
    var self = this;

    this.createForecastTable = function (data) {
        if (data.hasOwnProperty('error_msg')) {
            historyPage.loadHistoryPage();
            $("#forecast_table").hide();
            $("#error_msg").empty().show();

            var error_div = document.getElementById('error_msg');
            var txt = document.createTextNode(data['error_msg']);
            error_div.appendChild(txt);

        } else {
            $("#error_msg").empty().hide();
            $("#forecast_table_body").empty();
            $("#forecast_table").show();

            var table = document.getElementById("forecast_table_body");
            var rows = document.createElement("tr");
            rows.appendChild(fillTableCell_Text(data['city'] + data['country']));
            rows.appendChild(fillTableCell_Text(data['min_temperature']));
            rows.appendChild(fillTableCell_Text(data['max_temperature']));

            table.appendChild(rows);
        }
    };

    this.forecastById = function (id) {
        $("#spinner").show();
        $.ajax({
            type: 'GET',
            url: "/forecast/".concat(String(id), "/"),
            success: function (forecast) {
                $('#forecast_table_body').empty();
                self.createForecastTable(forecast);
                $("#spinner").hide();
            },
            error: function (data) {
                $('#forecast_table_body').empty();
                $("#spinner").hide();
                showErrorMsg("Oops..     Request failed: " + data.statusText +
                ". Please try again later.");
            }
        });
    };
}

function Pagination (perPageElementId) {
    this.elementId = perPageElementId;

    this.firstElelment = 0;
    this.elelmentPerPage = 10;
    this.maxElement = 10;
    var self  = this;

    this.refreshPaginationButtons = function () {
        var navi_status = document.getElementById('navigation_current');
        var txt = document.createTextNode("".concat(self.firstElelment, " - ",
            (Number(self.firstElelment) + Number(self.elelmentPerPage))));
        navi_status.appendChild(txt);

        $('#navigation_prev').hide();
        $('#navigation_next').hide();
        if (self.firstElelment != self.maxElement && self.firstElelment == 0) {
            $('#navigation_prev').hide();
            $('#navigation_next').show();
        } else if (0 <= self.firstElelment && Number(self.firstElelment) + Number(self.elelmentPerPage) < self.maxElement ) {
            $('#navigation_prev').show();
            $('#navigation_next').show();
        } else if (Number(self.maxElement) != 0  ) {
            $('#navigation_prev').show();
            $('#navigation_next').hide();
        }
    };

    this.updateVal = function () {
        $.ajax({
            type: "GET",
            url: "/history/",
            data: {'get_size': '1'},
            success: function (data) {
                self.maxElement = data['size'];
            },
            error: function () {
                showErrorMsg("Something wrong. Please reload page. NO SIZE.");
            }
        });
        var number;
        number = document.getElementById(self.elementId).value;
        if (number < 5) {
            document.getElementById(self.elementId).value = 5;
            number = 5;
        }
        self.elelmentPerPage = number;
    };


}

function HistoryPaginated () {
    var self  = this;

    this.fillTableCell_Urls = function (data) {
        var td = document.createElement("td");
        var elementA = document.createElement("a");
        var txt = document.createTextNode('check');
        elementA.onclick = function () {
            forecast.forecastById(data)
        };
        elementA.appendChild(txt);
        td.appendChild(elementA);
        return td;
    };

    this.historyJsonToTable = function (dataPage) {
        var table = document.getElementById("history_table_body");
        $.each(dataPage, function() {
            var rows = document.createElement("tr");
            rows.appendChild(fillTableCell_Text(this['city']));
            rows.appendChild(fillTableCell_Text(this['forecast_day']));
            rows.appendChild(fillTableCell_Text(this['services_name']));
            rows.appendChild(self.fillTableCell_Urls(this['url']));
            table.appendChild(rows);
        });
    };

    this.nextPage = function () {
        self.pagination.firstElelment += Number(self.pagination.elelmentPerPage);
        self.loadHistoryPage(Number(self.pagination.firstElelment), Number(self.pagination.elelmentPerPage));
    };

    this.prevPage = function () {
        self.pagination.firstElelment -= Number(self.pagination.elelmentPerPage);
        self.loadHistoryPage(Number(self.pagination.firstElelment), Number(self.pagination.elelmentPerPage));
    };


    this.loadHistoryPage = function (first, perPage) {
        self.pagination.updateVal();
        first = typeof first !== 'undefined' ? first : 0;
        perPage = typeof perPage !== 'undefined' ? perPage : self.pagination.elelmentPerPage;
        console.log('data ->', first, perPage);
        $.ajax({
            type: "GET",
            url: "/history/",
            data: {first_elem: first, per_page: perPage },
            success: function (data) {
                $('#history_table_body').empty();
                $('#navigation_current').empty();

                self.historyJsonToTable(data);
                self.pagination.refreshPaginationButtons();
            },
            error: function () {
                showErrorMsg("Something wrong. Please reload page.");
            }
        });
        self.pagination.updateVal();

    }

}

function showErrorMsg (msg) {
    $("#global_error_div").text(msg).show();
    setTimeout(function() {
        $("#global_error_div").text('').hide();
    }, 4000);
}

function temperatureDynamic(city){
    $.ajax({
        type: 'GET',
        url: "http://api.worldweatheronline.com/free/v2/weather.ashx",
        data: {q: String(city.replace('_',' ')), format: 'json', num_of_days: '5', key: "caccf05de4bf3a130dcd49c9a79d5"},
        success: function (forecastData) {
            if (forecastData.hasOwnProperty('error') || forecastData == undefined) {
                showErrorMsg("Oops.. Bad response from server. Please try again.");
                $("chart_div").hide();
            } else {
                var weather = forecastData['data']['weather'];
                var chartData = [];
                chartData.push(["Date", "Min. temperature", "Max. temperature"]);
                for (var i=0; i < weather.length; i++) {
                    var row = [];
                    row.push(weather[String(i)]['date'],
                        Number(weather[String(i)]['mintempC']),
                        Number(weather[String(i)]['maxtempC']));
                    chartData.push(row);
                }
                var data = google.visualization.arrayToDataTable(chartData);
                var options = {
                    title: 'Weather dynamic for ' + city,
                    hAxis: {title: 'Days',  titleTextStyle: {color: '#333'}},
                    vAxis: {title: 'Celsius', minValue: 0}
                };
                var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
                chart.draw(data, options);
            }
        },
        error: function() {
            $("chart_div").hide();
            showErrorMsg("Oops.. No response from server. Please try again later.");
        }
    });
}

HistoryPaginated.prototype.pagination =  new Pagination("elements_per_page");
var historyPage = new HistoryPaginated();
var forecast = new Forecast();