
const html_widget = document.querySelector<HTMLDivElement>("#app")!
html_widget.innerHTML = `
    <div class="main-window l-main-window first-layer-window">

    <img
    class="l-main-logo erdstall-logo"
    src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png"
    alt="TypeScript"
    />
    <header class="main-window__header l-main-window__header">
    <h1>Welcome to the demonstration of ErdPay</h1>
    <p>Select a demo to try</p>

    <style>
        button {
            margin: 10px
        }
    </style>
    </header>

    
    <button type="button" id="1">Pay with ERDSTALL</button>


    
    <button type="button" id="2">Check functionalities</button>

    </div>
    `;

const btn_transfer = document.getElementById('1')
btn_transfer?.addEventListener("click", () => {
    window.location.href= "ext/pay/index.html"
});

const btn_balance = document.getElementById('2')
btn_balance?.addEventListener("click", () => {
    window.location.href= "ext/functionality/index.html"
});

