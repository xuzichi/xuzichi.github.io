function ajaxRequestRetry(url, jsonData, token = "") {
    var def = $.Deferred();
    if (token !== "") {
        var requestDate = {
            'data': JSON.stringify(jsonData), //{action:'x',params:['a','b','c']}
            'type': 'POST',
            "headers": {
                'contentType': 'application/json',
                "Authorization": "Bearer " + token
            },
            'processData': false
        };
    } else {
        var requestDate = {
            'data': JSON.stringify(jsonData), //{action:'x',params:['a','b','c']}
            'type': 'POST',
            'processData': false,
            'contentType': 'application/json'
        };
    }
    $.ajax(url, requestDate).retry({ times: 3, timeout: 300 }).then(function (data) {
        // console.log(JSON.stringify(data));
        if (data.error) {
            if (data.error.code === "AUTH_ERROR") {
                showAlert(data.error.code);
                window.location.href = "/login";
            } else {
                // showAlert(data.error.code,changeToJapanese(JSON.parse(JSON.stringify(data.error.code))));
                showAlert("エラー", changeToJapanese(JSON.parse(JSON.stringify(data.error.code))));
            }
        } else {
            def.resolve(data);
        }
        if (data.token) {
            // alert(data.token);
            createCookie("oshitabi", data.token, 365);
            // localStorage.setItem("oshigoe",data.token);
        }
        if (data.tempToken) {
            // alert(data.token);
            createCookie("oshitabi-guest", data.tempToken, 365);
            // localStorage.setItem("oshigoe",data.token);
        }


    })
        .fail(function (err) {
            console.log(JSON.stringify(err));
            var info = (JSON.stringify(err));
            sessionStorage.setItem("info", info);
        })
        .always(function (data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
            //console.log(JSON.stringify(data_or_jqXHR));
        });
    return def.promise();
}


function ajaxRequest(url, jsonData, token = "") {
    var def = $.Deferred();
    if (token !== "") {
        var requestDate = {
            'data': JSON.stringify(jsonData), //{action:'x',params:['a','b','c']}
            'type': 'POST',
            "headers": {
                'contentType': 'application/json',
                "Authorization": "Bearer " + token
            },
            'processData': false
        };
    } else {
        var requestDate = {
            'data': JSON.stringify(jsonData), //{action:'x',params:['a','b','c']}
            'type': 'POST',
            'processData': false,
            'contentType': 'application/json'
        };
    }
    $.ajax(url, requestDate).then(function (data) {
        // console.log(JSON.stringify(data));
        if (data.error) {
            if (data.error.code === "AUTH_ERROR") {
                showAlert(data.error.code);
                window.location.href = "/login";
            } else if (data.error.code === "INVALID-ACCESS") {
                showAlert("エラー", changeToJapanese(JSON.parse(JSON.stringify(data.error.code))));
                setTimeout(() => {
                    window.location.href = "https://recommend.jr-central.co.jp/oshi-tabi/";
                }, 2000);
            } {
                // showAlert(data.error.code,changeToJapanese(JSON.parse(JSON.stringify(data.error.code))));
                showAlert("エラー", changeToJapanese(JSON.parse(JSON.stringify(data.error.code))));
            }
        } else {
            def.resolve(data);
        }
        if (data.token) {
            // alert(data.token);
            createCookie("oshitabi", data.token, 365);
            document.cookie = "oshitabi-guest=; max-age=0";
            document.cookie = "oshitabi-guest=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
            // localStorage.setItem("oshigoe",data.token);
        }
        if (data.tempToken) {
            createCookie("oshitabi-guest", data.tempToken, 365);
            // localStorage.setItem("oshigoe",data.token);
        }



    })
        .fail(function (err) {
            console.log(JSON.stringify(err));
            var info = (JSON.stringify(err));
            sessionStorage.setItem("info", info);
        })
        .always(function (data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
            //console.log(JSON.stringify(data_or_jqXHR));
        });
    return def.promise();
}

