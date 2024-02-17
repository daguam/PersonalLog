function uploadData() {
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = JSON.parse(e.target.result);
            for (const key in data) {
                localStorage.setItem(key, JSON.stringify(data[key]));
            }
            createEntryList(); // Refresh the entry list
        };
        reader.readAsText(file);
    }
}

function downloadData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = JSON.parse(localStorage.getItem(key));
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
    calendar.classList.add('my-4', 'p-2', 'border', 'border-gray-300', 'rounded');
    
    calendar.addEventListener('change', function(event) {
        displayEntryForDate(event.target.value);
    });

    document.getElementById('calendar').appendChild(calendar);

    // Load entry for current date by default
    const today = new Date().toISOString().split('T')[0];
    calendar.value = today;
    displayEntryForDate(today);

    // Initialize and display the entry list
    createEntryList();
});

function createEntryList() {
    const entries = JSON.parse(localStorage.getItem('entryList')) || [];
    let listDiv = document.getElementById('entryList');

    if (!listDiv) {
        listDiv = document.createElement('div');
        listDiv.id = 'entryList';
        document.body.insertBefore(listDiv, document.getElementById('calendar').nextSibling);
    } else {
        listDiv.innerHTML = '';
    }

    entries.forEach(date => {
        const dateElement = document.createElement('div');
        dateElement.textContent = date;
        listDiv.appendChild(dateElement);
    });
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

    // Save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Entry';
    saveButton.classList.add('bg-blue-500', 'hover:bg-blue-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded');
    saveButton.addEventListener('click', () => saveData(date));
    entryDiv.appendChild(saveButton);
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
