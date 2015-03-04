window.onload=function() {
    historyPage.loadHistoryPage();
    $.ajax({
        type: 'GET',
        url: "/weather/",
        success: function (data) {
            $("#parameter_div").html(data)
        },
        error: function () {
            showErrorMsg("Something wrong. Please reload page.");
        }
    });
};