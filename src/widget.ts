import { htmlBalance } from "./balance";
import { htmlCreateSessionForTransfer } from "./transfer";

export function widget(html: HTMLDivElement) {
    html.innerHTML = `
        <div class="widget_body" id="widgetBodyMain">
            <header class="widget__header">
                <h3> Welcome to ErdPay</h3>
            </header>
            <form>
                <button id="transfer">Transfer</button>
                <button id="balance">View Account Balance</button>
            </form>
        </div>
    `;

    const btn3 = document.querySelector<HTMLButtonElement>('#transfer');
    btn3?.addEventListener('click', () => {
        htmlCreateSessionForTransfer(document.querySelector<HTMLDivElement>('#widgetBodyMain')!)
    });

    const btn4 = document.querySelector<HTMLButtonElement>('#balance')
    btn4?.addEventListener('click', () => {
        htmlBalance(document.querySelector<HTMLDivElement>('#widgetBodyMain')!)
    })
}

export function makeWidgetButton() {
    const html = document.querySelector<HTMLDivElement>('#app')!
    html.innerHTML = `
    <div>
        <button id="mainButton" type="button"><img src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" class="logo" alt="TypeScript logo" /></button>
    </div>
    `;
    const btn = document.querySelector('#mainButton');
    btn?.addEventListener('click', () => widget(html))
}

makeWidgetButton()



















