export function createIcon(message: string, element:HTMLElement) {
    const iconFrame = document.createElement('div');
    iconFrame.classList.add('info-icon-frame')

    iconFrame.innerHTML = `<i class="fa-solid fa-circle-info info-icon"></i>`

    const infoBox = document.createElement('span')
    infoBox.classList.add('info-box')

    iconFrame.appendChild(infoBox)

    infoBox.innerHTML = message

    iconFrame.addEventListener('click', () => {
        infoBox.classList.toggle('clicked')
    })

    element.appendChild(iconFrame)
}

/***
 * This method will wrap the element you want to add a tooltip to into a container and put the tooltip icon next to it
 */
export function createTooltip(element:string, className:string, message:string) {
    //replicate the element type that should be wrapped
    const elem = document.createElement(element) 
    elem.classList.add(className)
    elem.innerHTML = document.querySelector("."+className)!.innerHTML

    const container = document.createElement('div')
    container.classList.add('container-with-infobox')

    container.appendChild(elem)
    createIcon(message, container)
    document.querySelector("."+className)?.replaceWith(container)

}


