import { eventPayPopup } from "./pay";

/**
 * Function to display startpage of the widget.
 */
export function makeWidgetButton() {
  const html_dummy = document.querySelector<HTMLDivElement>("#app")!;
  html_dummy.innerHTML = `
    <div class="dummy">
        <button id="pay button" class="pay-button" type="button">
            <span>Pay with</span> <img class="erdstall-logo" src="https://nifty.erdstall.dev/static/media/erdstall-logo.4ca5436f.png" class="logo" alt="TypeScript logo" />
        </button>
    </div>
    `;
  const btn_pay = document.getElementById("pay button");
  btn_pay?.addEventListener("click", () => eventPayPopup("",5,""));
}

makeWidgetButton();
