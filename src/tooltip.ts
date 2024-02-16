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


