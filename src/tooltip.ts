/**
 * This method creates a interactive tooltip icon to the right of an element.
 * Hovering over the icon creates a message box that disappears when the mouse cursor leaves the icon.
 * Clicking on the icon creates a static message box that disappears when click on the icon once again.
 *
 * To use this function you have to wrap the element you want to create a tooltip for in a div with class='content-with-tooltip'
 * ex.  <div class='content-with-tooltip'>
 *          <button> ... </button>
 *      </div>
 * @param message The message for the users to explain tools more in detail. It should be handed over as a string representing html code ex. '<p> ... </p>' .
 * @param selectorClass The wrapper element of the HTML-Element you want to attach the tooltip to
 * @param box_position A string that defines the position of the tooltip box relative to the icon. There are 4 possible inputs 'top', 'bottom, 'left' and 'right'
 */
export function createToolTip(
  message: string,
  selectorClass: string,
  box_position: string
) {
  const iconFrame = document.createElement("div");
  iconFrame.classList.add("tooltip-icon-frame");
  iconFrame.innerHTML = `<i class="fa-solid fa-circle-info tooltip-icon"></i>`;

  const element = document.querySelector("." + selectorClass)!;
  element.classList.add("content-with-tooltip");

  const tooltip = document.createElement("span");
  tooltip.classList.add("message-box-" + box_position);
  iconFrame.appendChild(tooltip);
  tooltip.innerHTML = message;
  tooltip.querySelector("p")!.classList.add("message-box-text");

  iconFrame.addEventListener("click", () => {
    tooltip.classList.toggle("clicked");
  });

  element.appendChild(iconFrame);
}

// export function insertTooltip(message:string, )
