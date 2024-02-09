export function createInfoBoxDiv(message: string) {
    const iconFrame = document.createElement('div');
    iconFrame.classList.add('info-icon-frame')

    iconFrame.innerHTML = `<i class="fa-solid fa-circle-info info-icon"></i>`

    /** Create if statement to catch type */
    const infoBox = document.createElement('div')
    infoBox.classList.add('info-box', 'invisible-info-box')

    iconFrame.append(infoBox)

    infoBox.innerHTML = `<p class = "info-message"> ${message} </p>`

    iconFrame.addEventListener('mouseover', () => {
        infoBox.classList.remove('invisible-info-box')
        infoBox.classList.add('visible-info-box')
    })

    iconFrame.addEventListener('mouseleave', () => {
        infoBox.classList.remove('visible-info-box')
        infoBox.classList.add('invisible-info-box')
    })

    return iconFrame
}