import { htmlBalance } from "./balance";
import { htmlCreateSessionForTransfer } from "./transfer";

export function start() {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div>
        <button id="mainButton" type="button">Erdpay</button>
        <div class="basePop" id="basePop">
            <div class="mainPop" id="mainPop">
                <button id="transfer">Transfer</button>
                <button id="balance">View Account Balance</button>
                <button id="close">Close</button>
            </div>
        </div>
    </div>
`;

    const btn = document.querySelector('#mainButton');
    btn?.addEventListener('click', () => {
        const list = document.querySelector('.basePop')?.classList;
        list?.add('open');
    });

    const btn2 = document.querySelector('#close');
    btn2?.addEventListener('click', () => {
        const list = document.querySelector('.basePop')?.classList;
        list?.remove('open');
    });

    const btn3 = document.querySelector('#transfer');
    btn3?.addEventListener('click', () => {
        htmlCreateSessionForTransfer(document.querySelector<HTMLDivElement>('#app')!)
    });

    const btn4 = document.querySelector('#balance')
    btn4?.addEventListener('click', () => {
        htmlBalance(document.querySelector<HTMLDivElement>('#app')!)
    })
}

start()



















