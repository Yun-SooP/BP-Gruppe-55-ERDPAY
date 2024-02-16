import { htmlCreateSession } from "./dashboard";


export function eventPayPopup() {
    // Create the overlay element
    const overlay = document.createElement('div');
    overlay.id = 'paymentOverlay';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
  
    // Create the popup element
    const popup = document.createElement('div');
    popup.id = 'paymentPopup';
    popup.style.maxWidth = '600px'; // Set a max-width if necessary
    popup.style.minWidth = '300px'; // Set a min-width if necessary
    popup.style.maxHeight = '80%'; // Set a max-height if necessary
    popup.style.minHeight = '200px'; // Set a min-height if necessary
    popup.style.overflowY = 'auto'; // Enable scroll if content is larger than max-height
    popup.style.backgroundColor = '#fff';
    popup.style.padding = '20px';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    popup.style.borderRadius = '10px';
    popup.style.textAlign = 'center';
    htmlPay(popup);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = closePaymentPopup;
    popup.appendChild(closeButton);
  

    // Append the popup to the overlay, then the overlay to the body
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}
  

  // Function to close the popup
function closePaymentPopup() {
    const overlay = document.getElementById('paymentOverlay');
    if (overlay) {
      overlay.remove();
    }
}

function htmlPay(div:HTMLDivElement) {
    // Your function logic that writes buttons and input texts into the div
    // For example:
    div.innerHTML = '<button>Submit Payment</button><input type="text" placeholder="Enter amount">';
}
  

  
  
  // Add event listener to your button
// function openPopup() {
//     const popup = window.open('../dist/dist/index.html', 'Popup', 'width=800,height=600,location=no,menubar=no,toolbar=no');
//     const address = {type: 'address', options: {address1: '0x69c6aBd542d2e64E618', address2: '177d2c5E617dFC3620ba7'}};
//     const amount = {type: 'amount', options: {amount: cart.total}};
//     const tokenAddress = {type: 'tokenAddress', options: {address: '0x923439be515b6a928cb9650d70000a9044e49e85'}};

//     window.addEventListener('message', (event) => {
//         if (event.source === popup && event.data.type === 'popupResult') {
//             popup!.close();
//             showPopup(event.data.result.value)
//             cart.removeAfterPurchase();
//         }
//         if (event.source === popup && event.data.type === 'ready') {
//             popup!.postMessage(address, '');
//             popup!.postMessage(amount, '');
//             popup!.postMessage(tokenAddress, '*');
//         }
//     });

// }