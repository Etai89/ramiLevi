let allItems = []
let filteredItems = []
let currentIndex = 0
const chunkSize = 100

function displayNextChunk() {
    const tbody = $('#item-table tbody')
    const chunk = filteredItems.slice(currentIndex, currentIndex + chunkSize)

    chunk.forEach(item => {
        const row = `
            <tr>
                <td>${item.ItemCode}</td>
                <td>${item.ItemName}</td>
                <td>${item.ManufacturerName}</td>
                <td>${item.ItemPrice} ₪</td>
                <td>${item.PriceUpdateDate}</td>
            </tr>
        `
        tbody.append(row)
    })

    currentIndex += chunkSize
    $('#total-items').text(`פריטים: ${filteredItems.length}`)
}

function resetTable() {
    $('#item-table tbody').empty()
    currentIndex = 0
    displayNextChunk()
}

function loadData() {
    $.getJSON('ramiData.json', function(data) {
        const items = Object.values(data)
        allItems = filterDuplicates(items)  // Apply duplicate check here
        filteredItems = [...allItems]
        populateManufacturerFilter(allItems)
        resetTable()
    }).fail(() => console.log('Error loading JSON data'))
}

function filterDuplicates(items) {
    const latestItems = {}

    items.forEach(item => {
        const existingItem = latestItems[item.ItemCode]

        // If there is no existing item or the current item's date is newer, update the record
        if (!existingItem || new Date(item.PriceUpdateDate) > new Date(existingItem.PriceUpdateDate)) {
            latestItems[item.ItemCode] = item
        }
    })

    // Return the values of the map as an array (the latest items)
    return Object.values(latestItems)
}

function applyFilters() {
    const searchQuery = $('#search-input').val().trim()
    const manufacturer = $('#manufacturer-select').val()

    filteredItems = allItems.filter(item => {
        const itemName = item.ItemName || ""  // Ensure ItemName is a string
        return itemName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (manufacturer === '' || item.ManufacturerName === manufacturer)
    })

    resetTable()
}

function populateManufacturerFilter(items) {
    const manufacturers = new Set(items.map(i => i.ManufacturerName))
    const select = $('#manufacturer-select')
    select.empty()
    select.append(new Option('כל היצרנים', ''))

    manufacturers.forEach(m => {
        select.append(new Option(m, m))
    })
}

$(document).ready(function() {
    loadData()

    $('#search-input').on('input', applyFilters)
    $('#manufacturer-select').on('change', applyFilters)

    $(window).on('scroll', function() {
        if ($(window).scrollTop() + $(window).height() >= $(document).height() - 300) {
            displayNextChunk()
        }
    })
})
