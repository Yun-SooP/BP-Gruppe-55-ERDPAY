var html_widget = document.querySelector("#app");
html_widget.innerHTML = "\n    <div class=\"main-window l-main-window first-layer-window\">\n\n    <img\n    class=\"l-main-logo erdstall-logo\"\n    src=\"https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png\"\n    alt=\"TypeScript\"\n    />\n    <header class=\"main-window__header l-main-window__header\">\n    <h1>Welcome to the demonstration of ErdPay</h1>\n    <p>Select a demo to try</p>\n\n    <style>\n        button {\n            margin: 10px\n        }\n    </style>\n    </header>\n\n    \n    <button type=\"button\" id=\"1\">Pay with ERDSTALL</button>\n\n\n    \n    <button type=\"button\" id=\"2\">Check functionalities</button>\n\n    </div>\n    ";
var btn_transfer = document.getElementById('1');
btn_transfer === null || btn_transfer === void 0 ? void 0 : btn_transfer.addEventListener("click", function () {
    window.location.href = "ext/pay/index.html";
});
var btn_balance = document.getElementById('2');
btn_balance === null || btn_balance === void 0 ? void 0 : btn_balance.addEventListener("click", function () {
    window.location.href = "ext/functionality/index.html";
});
