function uploadData() {
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (isValidData(data)) {
                    for (const key in data) {
                        localStorage.setItem(key, JSON.stringify(data[key]));
                    }
                    createEntryList(); // Refresh the entry list
                } else {
                    alert("Invalid file format");
                }
            } catch (error) {
                console.error("Error reading file:", error); // Log the error to the console
                alert("An error occurred while reading the file");
            }
        };
        reader.readAsText(file);
    } else {
        // Alert the user to choose a file
        alert("Please choose a file to upload");
    }
}

function isValidData(data) {
    // Check if data is an object
    if (typeof data !== "object" || data === null) {
        return false;
    }

    // Check each key and its corresponding value structure
    for (const key in data) {
        const entry = data[key];
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            return false;
        }
        const sections = ['dream', 'idea', 'reflections', 'lessons-learned', 'diet'];
        for (const section of sections) {
            if (!(section in entry)) {
                return false;
            }
        }
    }
    return true;
}

function downloadData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'entryList') { // Exclude 'entryList' from the download file
            data[key] = JSON.parse(localStorage.getItem(key));
        }
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "notebook_data.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

document.addEventListener('DOMContentLoaded', function() {
    const calendar = document.createElement('input');
    calendar.setAttribute('type', 'date');
    calendar.setAttribute('id', 'calendar-input');

    calendar.classList.add('form-input', 'w-38', 'mx-2', 'text-xs', 'my-4', 'p-2', 'border', 'border-gray-300', 'rounded');
    
    calendar.addEventListener('change', function(event) {
        displayEntryForDate(event.target.value);
    });

    document.getElementById('calendar').appendChild(calendar);

    // Load entry for current date by default
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    const localISODate = new Date(today - offset).toISOString().split('T')[0];
    calendar.value = localISODate;
    displayEntryForDate(localISODate);

    const saveButton = document.getElementById('saveEntryButton');
    saveButton.addEventListener('click', function() {
        const selectedDate = document.querySelector('input[type="date"]').value;
        saveData(selectedDate);
    });

    // Initialize and display the entry list
    createEntryList();
});

function createEntryList() {
    let listDiv = document.getElementById('entryListContainer');

    listDiv.innerHTML = ''; // Clear existing content

    // Fetch keys from localStorage and filter out non-date keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.match(/^\d{4}-\d{2}-\d{2}$/)) { // Regex to check if key is a date (YYYY-MM-DD)
            const dateElement = document.createElement('div');
            dateElement.textContent = key;
            dateElement.classList.add('cursor-pointer', 'hover:bg-gray-200'); // Tailwind classes for styling
            dateElement.onclick = () => loadDateEntry(key);
            listDiv.appendChild(dateElement);
        }
    }
}

function loadDateEntry(date) {
    const calendar = document.getElementById('calendar-input');
    calendar.value = date;
    displayEntryForDate(date);
}

function displayEntryForDate(date) {
    const entryDiv = document.getElementById('entry');
    const sections = ['Dream', 'Idea', 'Reflections', 'Lessons Learned', 'Diet'];
    
    entryDiv.innerHTML = sections.map(section => `
        <div class="mt-4">
            <label class="text-lg font-bold">${section}</label>
            <textarea id="${section.toLowerCase().replace(/ /g, '-')}" class="w-full p-2 border border-gray-300 rounded my-2" rows="6" placeholder="${section}"></textarea>
        </div>
    `).join('');

    // Load existing data if available
    loadData(date);
    
}

function saveData(date) {
    const sections = ['dream', 'idea', 'reflections', 'lessons-learned', 'diet'];
    const data = {};
    sections.forEach(section => {
        data[section] = document.getElementById(section).value;
    });
    localStorage.setItem(date, JSON.stringify(data));

    // Update the entry list
    updateEntryList(date);
}

function loadData(date) {
    const data = JSON.parse(localStorage.getItem(date));
    if (data) {
        const sections = ['dream', 'idea', 'reflections', 'lessons-learned', 'diet'];
        sections.forEach(section => {
            document.getElementById(section).value = data[section] || '';
        });
    }
}

function updateEntryList(date) {
    let entries = JSON.parse(localStorage.getItem('entryList')) || [];
    if (!entries.includes(date)) {
        entries.push(date);
        localStorage.setItem('entryList', JSON.stringify(entries));
        createEntryList();
    }
}
