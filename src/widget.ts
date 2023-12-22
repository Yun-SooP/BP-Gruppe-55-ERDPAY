import { htmlBalance } from "./balance";
import { htmlCreateSessionForTransfer } from "./transfer";

export function widget(html: HTMLDivElement) {
    html.innerHTML = `
        <button id="transfer">Transfer</button>
        <button id="balance">View Account Balance</button>
    `;

    const btn3 = document.querySelector('#transfer');
    btn3?.addEventListener('click', () => {
        htmlCreateSessionForTransfer(document.querySelector<HTMLDivElement>('#app')!)
    });

    const btn4 = document.querySelector('#balance')
    btn4?.addEventListener('click', () => {
        htmlBalance(document.querySelector<HTMLDivElement>('#app')!)
    })
}

export function makeWidgetButton() {
    const html = document.querySelector<HTMLDivElement>('#app')!
    html.innerHTML = `
    <div>
        <button id="widgetButton" type="button">Erdpay</button>
    </div>
    `;
    const btn = document.querySelector('#widgetButton');
    btn?.addEventListener('click', () => widget(html))
}

makeWidgetButton()



















