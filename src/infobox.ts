export function createInfoBox(message: string) {
    const iconFrame = document.createElement('div');
    iconFrame.classList.add('info-icon-frame')

    iconFrame.innerHTML = `<i class="fa-solid fa-circle-info info-icon"></i>`

    const infoBox = document.createElement('span')
    infoBox.classList.add('info-box')

    iconFrame.append(infoBox)

    infoBox.innerHTML = message

    return iconFrame
}


