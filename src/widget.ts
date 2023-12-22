import { htmlBalance } from "./balance";
import { htmlCreateSessionForTransfer } from "./transfer";

export function widget(html: HTMLDivElement) {
    html.innerHTML = `
        <div class="widget_body" id="widgetBodyMain">
        </div>
    `;
    const body = document.querySelector<HTMLDivElement>('#widgetBodyMain')!
    widgetBody(body)
}
export function widgetBody(html: HTMLDivElement){
    html.innerHTML = `
        <header class="widget__header">
            <h3> Welcome to ErdPay</h3>
        </header>
        <form>
            <button id="transfer">Transfer</button>
            <button id="balance">View Account Balance</button>
        </form>
    `;
    const btn3 = document.querySelector<HTMLButtonElement>('#transfer');
    btn3?.addEventListener('click', () => {
        htmlCreateSessionForTransfer(html)
    });

    const btn4 = document.querySelector<HTMLButtonElement>('#balance')
    btn4?.addEventListener('click', () => {
        htmlBalance(html)
    })
}

export function makeWidgetButton() {
    const html = document.querySelector<HTMLDivElement>('#app')!
    html.innerHTML = `
    <div>
        <button id="mainButton" type="button">
            <img src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" class="logo" alt="TypeScript logo" />
        </button>
    </div>
    `;
    const btn = document.querySelector('#mainButton');
    btn?.addEventListener('click', () => {
        widget(html)
    })
}

makeWidgetButton()



















