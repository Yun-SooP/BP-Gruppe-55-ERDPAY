export function createIcon(message: string) {
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

    document.querySelector('.content-with-infobox')!.appendChild(iconFrame)
}


