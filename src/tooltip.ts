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
 */
export function createToolTip(message: string) {
    const iconFrame = document.createElement('div');
    iconFrame.classList.add('tooltip-icon-frame')

    iconFrame.innerHTML = `<i class="fa-solid fa-circle-info tooltip-icon"></i>`

    const tooltip = document.createElement('span')
    tooltip.classList.add('message-box')
    iconFrame.appendChild(tooltip)
    tooltip.innerHTML = message

    iconFrame.addEventListener('click', () => {
        tooltip.classList.toggle('clicked')
    })

    document.querySelector('.content-with-tooltip')!.appendChild(iconFrame)
}


