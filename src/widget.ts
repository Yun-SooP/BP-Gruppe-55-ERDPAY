const main = document.body.innerHTML = `
    <div>
        <button id="mainButton" type="button">Erdpay</button>
        <div class="widget-body" id="widget-body">
            <div>
            </div>
            <div class="button-container" id="button-container">
                <button id="transfer">Transfer</button>
                <button id="balance">View Account Balance</button>
                <button id="close">Close</button>
            </div>
        </div>
    </div>
`;

const btn = document.querySelector('#mainButton');
btn?.addEventListener('click', () => {
    const list = document.querySelector('.widget-body')?.classList;
    list?.add('open');
});

const btn2 = document.querySelector('#close');
btn2?.addEventListener('click', () => {
    const list = document.querySelector('.widget-body')?.classList;
    list?.remove('open');
});

const btn3 = document.querySelector('#transfer');
btn3?.addEventListener('click', () => {
    window.location.href = '/src/transfer.html';
});

const btn4 = document.querySelector('#balance');
btn4?.addEventListener('click', () => {
    window.location.href = '/src/balance.html';
});


















