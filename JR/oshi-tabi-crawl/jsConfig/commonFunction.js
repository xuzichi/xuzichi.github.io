function createCookie(name, value, days) {
    //alert("called");
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        var date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    document.cookie = name + "=" + value + expires + "; path=/;";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return false;
}


function setCookie(uniqueId) {
    var maxAge = 86400 * 365;
    document.cookie = "uniqueId="+uniqueId+"; max-age=" + maxAge;
}

function goBack() {
    window.location.hash = window.location.lasthash[window.location.lasthash.length - 1];
    //blah blah blah
    window.location.lasthash.pop();
}

function isInAppBrowser() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Detect Facebook in-app browser
    if (/FBAN|FBAV|FBIOS|FB_IAB|FB4A|FBAVC|FBOP|FBCR/i.test(userAgent)) {
        return true;
    }

    // Detect Instagram in-app browser
    if (/Instagram|INSTAGRAM/i.test(userAgent)) {
        return true;
    }

    // Detect Twitter in-app browser
    if (/Twitter|TWTR/i.test(userAgent)) {
        return true;
    }

    // Detect Line in-app browser
    if (/Line|LINE/i.test(userAgent)) {
        return true;
    }

    // Detect other common webviews
    if (/WebView/i.test(userAgent)) {
        return true;
    }

    return false;
}


function changeToJapanese(code) {
    var jaCode;
    switch (code) {
        case 'AUTH_ERROR':
            jaCode = "認証に失敗しました。";
            break
        case 'INVALID_LOGIN_INFO':
            jaCode = "ログイン情報が違います。";
            break;
        case 'NO_USER_FOUND':
            jaCode = "ユーザーが見つかりませんでした。";
            break;
        case 'EXISTING_ACCOUNT':
            jaCode = "このログインIDは既に登録されています。別のIDを使用してください。";
            break
        case 'WRONG_REGISTER_ID':
            jaCode = "識別IDが間違っています。";
            break
        case 'INVALID_ID':
            jaCode = "ログイン情報が間違っています。";
            break
        case 'INVALID-ACCESS':
            jaCode = "不正なアクセスを検知しました。";
            break
        case 'WRONG_CODE':
            jaCode = "「あいことば」が間違っています。";
            break
        case 'USED_CODE':
            jaCode = "既に使用されている「あいことば」です";
            break
        case 'CODE_ERROR':
            jaCode = "コードを使用することができませんでした。";
            break
        case 'INSUFFICIENT_POINTS':
            jaCode = "ポイントが足りません。";
            break
            
        default:
            jaCode = "不明なエラーです。" + "エラーコード:" + code;
            break;
    }
    return jaCode;
}