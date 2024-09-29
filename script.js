function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

document.getElementById('dataForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const pdfFile = document.getElementById('pdfFile').files[0];
    const name = document.getElementById('name').value;
    const enrollmentNumber = document.getElementById('enrollmentNumber').value;
    const status = document.getElementById('status').value;
    const date = new Date().toLocaleDateString();
    
    if (pdfFile && name && enrollmentNumber && status) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = {
                pdfFile: e.target.result,
                pdfFileName: pdfFile.name,
                name: name,
                enrollmentNumber: enrollmentNumber,
                status: status,
                date: date
            };
            
            localStorage.setItem(Date.now(), JSON.stringify(data));
            window.location.href = 'data.html';
        };
        reader.readAsDataURL(pdfFile);
    } else {
        alert('Please fill in all fields.');
    }
});

function displayData(filter = 'all', startDate = null, endDate = null) {
    const dataContainer = document.getElementById('dataContainer');
    dataContainer.innerHTML = '';
    
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const data = JSON.parse(localStorage.getItem(key));
            const dataDate = new Date(data.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            
            if ((filter === 'all' || data.status === filter) &&
                (!start || dataDate >= start) &&
                (!end || dataDate <= end)) {
                const dataItem = document.createElement('div');
                dataItem.className = 'data-item';
                dataItem.innerHTML = `
                    <p>PDF File: <a href="${data.pdfFile}" download="${data.pdfFileName}">Download PDF</a></p>
                    <p>Name: ${data.name}</p>
                    <p>Enrollment Number: ${data.enrollmentNumber}</p>
                    <p>Status: ${data.status}</p>
                    <p>Date: ${data.date}</p>
                    <label for="editStatus">Edit Status:</label>
                    <select id="editStatus" onchange="updateStatus('${key}', this.value)">
                        <option value="process" ${data.status === 'process' ? 'selected' : ''}>Process</option>
                        <option value="generated" ${data.status === 'generated' ? 'selected' : ''}>Generated</option>
                        <option value="rejected" ${data.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                    <button onclick="confirmDelete('${key}')">Delete</button>
                `;
                dataContainer.appendChild(dataItem);
            }
        }
    }
}

function updateStatus(key, newStatus) {
    const data = JSON.parse(localStorage.getItem(key));
    data.status = newStatus;
    localStorage.setItem(key, JSON.stringify(data));
    filterData();
}

function filterData() {
    const filter = document.getElementById('filterOptions').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    displayData(filter, startDate, endDate);
}

function resetDateFilter() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    filterData();
}

function confirmDelete(key) {
    if (confirm('Are you sure you want to delete this data?')) {
        localStorage.removeItem(key);
        filterData();
    }
}

function downloadAllData() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const data = JSON.parse(localStorage.getItem(key));
            doc.text(`PDF File: ${data.pdfFileName}`, 10, y);
            y += 10;
            doc.text(`Name: ${data.name}`, 10, y);
            y += 10;
            doc.text(`Enrollment Number: ${data.enrollmentNumber}`, 10, y);
            y += 10;
            doc.text(`Status: ${data.status}`, 10, y);
            y += 10;
            doc.text(`Date: ${data.date}`, 10, y);
            y += 20;
            
            // Check if the page height is exceeded and add a new page if necessary
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
        }
    }
    
    doc.save('all_data.pdf');
}

window.onload = function() {
    if (document.getElementById('dataContainer')) {
        displayData();
    }
};
document.getElementById('searchBox').addEventListener('input', function () {
    searchData();
});

function searchData() {
    const searchValue = document.getElementById('searchBox').value.toLowerCase();
    const dataItems = document.querySelectorAll('#dataContainer .dataItem');

    dataItems.forEach(function(item) {
        const name = item.querySelector('.name').innerText.toLowerCase();
        const enrollmentNumber = item.querySelector('.enrollment').innerText.toLowerCase();

        if (name.includes(searchValue) || enrollmentNumber.includes(searchValue)) {
            item.style.display = ''; // Show item if it matches the search
        } else {
            item.style.display = 'none'; // Hide item if it doesn't match
        }
    });
}