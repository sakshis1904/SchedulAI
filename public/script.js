document.addEventListener('DOMContentLoaded', () => {
    
    const scheduleForm = document.getElementById('scheduleForm');
    const textInput = document.getElementById('textInput');
    const imageInput = document.getElementById('imageInput');
    const fileNameDisplay = document.getElementById('fileName');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    const resultSection = document.getElementById('resultSection');
    const statusBadge = document.getElementById('statusBadge');
    const messageBox = document.getElementById('messageBox');

    const resDepartment = document.getElementById('resDepartment');
    const resDate = document.getElementById('resDate');
    const resTime = document.getElementById('resTime');
    const resTz = document.getElementById('resTz');

    
    const tabs = document.querySelectorAll('.tab-btn');
    const textContainer = document.getElementById('textInputContainer');
    const imageContainer = document.getElementById('imageInputContainer');
    let activeMode = 'text';

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeMode = tab.dataset.tab;

            if (activeMode === 'text') {
                textContainer.classList.remove('hidden');
                imageContainer.classList.add('hidden');
            } else {
                textContainer.classList.add('hidden');
                imageContainer.classList.remove('hidden');
            }

            resultSection.classList.add('hidden');
        });
    });

    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.textContent = e.target.files[0].name;
        } else {
            fileNameDisplay.textContent = '';
        }
    });

    scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let payload;
        let isMultipart = false;

        if (activeMode === 'text') {
            const text = textInput.value.trim();
            if (!text) {
                alert('Please enter some text.');
                return;
            }
            payload = JSON.stringify({ text });
        } else {
            const file = imageInput.files[0];
            if (!file) {
                alert('Please select an image.');
                return;
            }

            payload = new FormData();
            payload.append('image', file);
            isMultipart = true;
        }

        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        submitBtn.disabled = true;
        resultSection.classList.add('hidden');
        messageBox.classList.add('hidden');

        try {
        
            const options = {
                method: 'POST',
                body: payload
            };


            if (!isMultipart) {
                options.headers = { 'Content-Type': 'application/json' };
            }

            const response = await fetch('/api/schedule', options);
            const data = await response.json();

            displayResults(data);

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while communicating with the server.');
        } finally {
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    function displayResults(data) {
        resultSection.classList.remove('hidden');

        statusBadge.className = 'status-badge';

        let displayData = {};

        if (data.status === 'ok' && data.appointment) {
           
            statusBadge.textContent = 'Scheduled';
            statusBadge.classList.add('status-ok');

            displayData = data.appointment;

        } else if (data.status === 'needs_clarification') {
            
            statusBadge.textContent = 'Needs Clarification';
            statusBadge.classList.add('status-warning');

       
            messageBox.textContent = data.message;
            messageBox.classList.remove('hidden');

            displayData = data.extracted || {};
        } else {
        
            statusBadge.textContent = 'Error';
            statusBadge.classList.add('status-warning'); 
            messageBox.textContent = data.message || 'Unknown error occurred';
            messageBox.classList.remove('hidden');
        }

        
        resDepartment.textContent = displayData.department || '--';


        resDate.textContent = displayData.date || displayData.date_phrase || '--';
        resTime.textContent = displayData.time || displayData.time_phrase || '--';

        resTz.textContent = displayData.tz || 'Asia/Kolkata'; 
    }
});
