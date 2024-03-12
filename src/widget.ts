import { eventPayPopup } from "./pay";

/**
 * Function to display startpage of the widget.
 */
export function makeWidgetButton() {
  const tokenAddress = "0x923439be515b6a928cb9650d70000a9044e49e85";
  const amount = 3;
  const recipientAddress = "0x72ca3dd960c157bd3e8d5654c8ed381ef4d8c840";
  const html_dummy = document.querySelector<HTMLDivElement>("#app")!;
  html_dummy.innerHTML = `
    <div class="dummy">
      <h2 class="first-layer-window">pay ${amount} of ${tokenAddress} with ErdPay</h2>
      <button id="pay button" class="pay-button" type="button">
          <span>Pay with</span> <img class="erdstall-logo" src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" class="logo" alt="TypeScript logo" />
      </button>
    </div>
    `;
  const btn_pay = document.getElementById("pay button");
  btn_pay?.addEventListener("click", async () => {
    const paid = await eventPayPopup(tokenAddress, amount, recipientAddress);
    html_dummy.innerHTML = `
    <div class="dummy">
      <h1>${paid ? "Payment is made" : "Payment is not made"}</h1>
    </div>
    `;
  });
}

makeWidgetButton();
