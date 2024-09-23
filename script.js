const $ = el => document.querySelector(el)
const $$ = el => document.querySelectorAll(el)

const imageInput = $('#image-input')
const itemsSection = $('#selector-items')
const resetBtn = document.getElementById('reset-tier-btn')
const saveBtn = document.getElementById('save-tier-btn')

function createItem (src) {
    const imgElement = document.createElement('img')
    imageInput.draggable = true
    imgElement.src = src
    imgElement.className = 'item-image'

    imgElement.addEventListener('dragstart', handleDragStart)
    imgElement.addEventListener('dragend', handleDragEnd)

    itemsSection.appendChild(imgElement)
    return imgElement
}

function useFilesToCreateItems(files) {
    if(files && files.length > 0) {
        Array.from(files).forEach(file => {
           const reader = new FileReader()

            reader.onload = (eventReader) => {
            createItem(eventReader.target.result)
        }

        reader.readAsDataURL(file) 
        })
    }
}

imageInput.addEventListener('change', (event) => {
    const { files } = event.target

    useFilesToCreateItems(files)    
})

let dragendElement = null
let sourceContainer = null

const levels = $$('.tier .level')

levels.forEach(level => {
    level.addEventListener('drop', handleDrop)
    level.addEventListener('dragover', handleDragOver)
    level.addEventListener('dragleave', handleDragLeave)
})

itemsSection.addEventListener('drop', handleDrop)
itemsSection.addEventListener('dragover', handleDragOver)
itemsSection.addEventListener('dragleave', handleDragLeave)

itemsSection.addEventListener('drop', handleDropFromDesktop)
itemsSection.addEventListener('dragover', handleDragOverFromDesktop)

function handleDragOverFromDesktop(event) {
    event.preventDefault()

    const { currentTarget, dataTransfer } = event

    if(dataTransfer.types.includes('Files')) {
        currentTarget?.classList?.remove('no-files')
        currentTarget.classList.add('drag-files')
    } else if(!dataTransfer.types.includes('Files')) {
        currentTarget?.classList?.remove('drag-files')
        currentTarget.classList.add('no-files')
    }
}

function handleDropFromDesktop(event) {
    event.preventDefault()

    const { currentTarget, dataTransfer } = event

    if(dataTransfer.types.includes('Files')) {
        currentTarget.classList.remove('drag-files')
        const { files } = dataTransfer
        useFilesToCreateItems(files)
    } else if(!dataTransfer.types.includes('Files')) {
        currentTarget?.classList?.remove('no-files')
    }
}

function handleDragOver (event) {
    event.preventDefault()

    const { currentTarget } = event
    if(currentTarget === sourceContainer) return

    currentTarget.classList.add('drag-over')

    const dragPreview = $('.drag-preview')

    if(dragendElement && !dragPreview) {
        const previewELement = dragendElement.cloneNode(true)
        previewELement.classList.add('drag-preview')
        currentTarget.appendChild(previewELement)
    }
}

function handleDragLeave (event) {
    event.preventDefault()

    const { currentTarget } = event
    currentTarget.classList.remove('drag-over')
    currentTarget.querySelector('.drag-preview')?.remove()
}

function handleDrop (event) {
    event.preventDefault()

    const { currentTarget, dataTransfer } = event
    console.log(currentTarget)

    if(sourceContainer && dragendElement) {
        sourceContainer.removeChild(dragendElement)
    }

    if(dragendElement) {
        const src = dataTransfer.getData('text/plain') || dragendElement.src
        const imgElement = createItem(src)
        currentTarget.appendChild(imgElement)
    }

    currentTarget.classList.remove('drag-over')
    currentTarget.querySelector('.drag-preview')?.remove()
}

function handleDragStart (event) {
    dragendElement = event.target
    sourceContainer = dragendElement.parentNode
    event.dataTransfer.setData('text/plain', dragendElement.src)
}

function handleDragEnd (event) {
    dragendElement = null
    sourceContainer = null
}

resetBtn.addEventListener('click', (event) => {
    const items = $$('.tier .item-image')
    items.forEach(item => {
        item.remove()

        itemsSection.appendChild(item)
    })
})

saveBtn.addEventListener('click', (event) => {
    const tierContainer = $('.tier')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    import('https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/+esm')
    .then(({ default: html2canvas }) => {
        html2canvas(tierContainer).then(canvas => {
           ctx.drawImage(canvas, 0, 0)
            const imgURL = canvas.toDataURL('image/png')

            const dowloadLink = document.createElement('a')
            dowloadLink.download = 'tier.png'
            dowloadLink.href = imgURL
            dowloadLink.click() 
        })
    })
})
