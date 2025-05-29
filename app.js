// Evil-Eval: Prompt Generator


// Populate dropdown on page load
function updateSavedInputsDropdown() {
    const select = document.getElementById('savedInputs');
    if (!select) return;
    while (select.options.length > 1) select.remove(1);
    let names = JSON.parse(localStorage.getItem('evil-eval-names') || '[]');
    names.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
    });
}
updateSavedInputsDropdown();

// Load saved input when dropdown changes
document.getElementById('savedInputs').addEventListener('change', function() {
    const name = this.value;
    if (!name) return;
    const data = JSON.parse(localStorage.getItem('evil-eval-input-' + name) || '{}');
    if (!data || !data.employeeName) return;
    // Set value for input (type="text")
    const employeeNameInput = document.getElementById('employeeName');
    if (employeeNameInput) employeeNameInput.value = data.employeeName || '';
    // Set value for select
    const pronounsSelect = document.getElementById('pronouns');
    if (pronounsSelect) pronounsSelect.value = data.pronouns || '';
    // Set value for textareas
    const studentServicesTextarea = document.getElementById('studentServices');
    if (studentServicesTextarea) studentServicesTextarea.value = data.studentServices || '';
    const collegeServiceStrengthsTextarea = document.getElementById('collegeServiceStrengths');
    if (collegeServiceStrengthsTextarea) collegeServiceStrengthsTextarea.value = data.collegeServiceStrengths || '';
    const collegeServiceImprovementsTextarea = document.getElementById('collegeServiceImprovements');
    if (collegeServiceImprovementsTextarea) collegeServiceImprovementsTextarea.value = data.collegeServiceImprovements || '';
    const workAccomplishmentsTextarea = document.getElementById('workAccomplishments');
    if (workAccomplishmentsTextarea) workAccomplishmentsTextarea.value = data.workAccomplishments || '';
    const workPerformanceStrengthsTextarea = document.getElementById('workPerformanceStrengths');
    if (workPerformanceStrengthsTextarea) workPerformanceStrengthsTextarea.value = data.workPerformanceStrengths || '';
    const workPerformanceImprovementsTextarea = document.getElementById('workPerformanceImprovements');
    if (workPerformanceImprovementsTextarea) workPerformanceImprovementsTextarea.value = data.workPerformanceImprovements || '';
    const overallNotesTextarea = document.getElementById('overallNotes');
    if (overallNotesTextarea) overallNotesTextarea.value = data.overallNotes || '';
});

document.getElementById('eval-form').addEventListener('submit', function(e) {
    // Save form input to localStorage under employee name
    function getFormData() {
        return {
            employeeName: document.getElementById('employeeName').value.trim(),
            pronouns: document.getElementById('pronouns').value,
            studentServices: document.getElementById('studentServices').value,
            collegeServiceStrengths: document.getElementById('collegeServiceStrengths').value,
            collegeServiceImprovements: document.getElementById('collegeServiceImprovements').value,
            workAccomplishments: document.getElementById('workAccomplishments').value,
            workPerformanceStrengths: document.getElementById('workPerformanceStrengths').value,
            workPerformanceImprovements: document.getElementById('workPerformanceImprovements').value,
            overallNotes: document.getElementById('overallNotes').value
        };
    }

    function saveFormData(name, data) {
        if (!name) return;
        localStorage.setItem('evil-eval-input-' + name, JSON.stringify(data));
        // Update the list of names
        let names = JSON.parse(localStorage.getItem('evil-eval-names') || '[]');
        if (!names.includes(name)) {
            names.push(name);
            localStorage.setItem('evil-eval-names', JSON.stringify(names));
        }
    }

    function updateSavedInputsDropdown() {
        const select = document.getElementById('savedInputs');
        if (!select) return;
        // Remove all except the first option
        while (select.options.length > 1) select.remove(1);
        let names = JSON.parse(localStorage.getItem('evil-eval-names') || '[]');
        names.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            select.appendChild(opt);
        });
    }

    // On submit, save input
    let employeeName = document.getElementById('employeeName').value.trim();
    if (employeeName) {
        saveFormData(employeeName, getFormData());
        updateSavedInputsDropdown();
    }
    // Get and format student services as a markdown bulleted list
    let studentServicesRaw = document.getElementById('studentServices').value.trim();
    let studentServicesList = [];
    if (studentServicesRaw) {
        // Split by newlines or commas, trim, and filter out empty
        studentServicesList = studentServicesRaw.split(/\n|,/).map(s => s.trim()).filter(Boolean);
    }
    let studentServicesMarkdown = studentServicesList.length
        ? studentServicesList.map(s => s.match(/^\s*-/) ? s : `- ${s}`).join('\n')
        : '';

    // Get other College Service fields
    const collegeServiceStrengths = document.getElementById('collegeServiceStrengths').value.trim();
    const collegeServiceImprovements = document.getElementById('collegeServiceImprovements').value.trim();

    // Get Work Performance fields
    const workAccomplishmentsRaw = document.getElementById('workAccomplishments').value.trim();
    let workAccomplishmentsList = [];
    if (workAccomplishmentsRaw) {
        workAccomplishmentsList = workAccomplishmentsRaw.split(/\n|,/).map(s => s.trim()).filter(Boolean);
    }
    let workAccomplishmentsMarkdown = workAccomplishmentsList.length
        ? workAccomplishmentsList.map(s => s.match(/^\s*-/) ? s : `- ${s}`).join('\n')
        : '';
    const workPerformanceStrengths = document.getElementById('workPerformanceStrengths').value.trim();
    const workPerformanceImprovements = document.getElementById('workPerformanceImprovements').value.trim();

    // Get Overall notes
    const overallNotes = document.getElementById('overallNotes').value.trim();
    e.preventDefault();
    // Capitalize each word in the name
    employeeName = employeeName.replace(/\b\w+/g, function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    const pronouns = document.getElementById('pronouns').value;
    if (!employeeName) {
        document.getElementById('output').textContent = 'Please provide the employee name.';
        return;
    }
    // Fetch the prompt template and example evals from files
    Promise.all([
        fetch('prompt-template.txt').then(r => r.text()),
        fetch('eval_examples/eval1.txt').then(r => r.text()),
        fetch('eval_examples/eval2.txt').then(r => r.text()),
        fetch('eval_examples/eval3.txt').then(r => r.text())
    ]).then(([template, eval1, eval2, eval3]) => {
        let prompt = template
            .replace(/{{employee_name}}/gi, employeeName)
            .replace(/{{pronouns}}/gi, pronouns)
            .replace(/{{student_services}}/gi, studentServicesMarkdown)
            .replace(/{{college_service_strengths}}/gi, collegeServiceStrengths)
            .replace(/{{college_service_improvements}}/gi, collegeServiceImprovements)
            .replace(/{{work_accomplishments}}/gi, workAccomplishmentsMarkdown)
            .replace(/{{work_performance_strengths}}/gi, workPerformanceStrengths)
            .replace(/{{work_performance_improvements}}/gi, workPerformanceImprovements)
            .replace(/{{overall_notes}}/gi, overallNotes)
            .replace(/{{example_eval1}}/gi, eval1.trim())
            .replace(/{{example_eval2}}/gi, eval2.trim())
            .replace(/{{example_eval3}}/gi, eval3.trim());
        document.getElementById('output').textContent = prompt;
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.style.display = 'inline-block';
        copyBtn.textContent = 'Copy';
        copyBtn.disabled = false;
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.style.display = 'inline-block';
        saveBtn.disabled = false;
    }).catch(() => {
        document.getElementById('output').textContent = 'Error loading prompt template or examples.';
        document.getElementById('copyBtn').style.display = 'none';
        document.getElementById('saveBtn').style.display = 'none';
    });
// Save button functionality
document.getElementById('saveBtn').addEventListener('click', function() {
    const output = document.getElementById('output');
    const text = output.textContent;
    if (!text) return;
    // Get employee name for filename
    let employeeName = document.getElementById('employeeName').value.trim();
    employeeName = employeeName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
    // Get current date in YYYY-MM-DD
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const filename = `performance-eval-${employeeName || 'employee'}-${dateStr}.md`;
    // Create and trigger download
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
});

// Copy button functionality
document.getElementById('copyBtn').addEventListener('click', function() {
    const output = document.getElementById('output');
    const text = output.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        this.textContent = 'Copied!';
        this.disabled = true;
        setTimeout(() => {
            this.textContent = 'Copy';
            this.disabled = false;
        }, 1200);
    });
});

// Populate dropdown on page load
function updateSavedInputsDropdown() {
    const select = document.getElementById('savedInputs');
    if (!select) return;
    while (select.options.length > 1) select.remove(1);
    let names = JSON.parse(localStorage.getItem('evil-eval-names') || '[]');
    names.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
    });
}
updateSavedInputsDropdown();

// Load saved input when dropdown changes
document.getElementById('savedInputs').addEventListener('change', function() {
    const name = this.value;
    if (!name) return;
    const data = JSON.parse(localStorage.getItem('evil-eval-input-' + name) || '{}');
    if (!data || !data.employeeName) return;
    // Set value for input (type="text")
    const employeeNameInput = document.getElementById('employeeName');
    if (employeeNameInput) employeeNameInput.value = data.employeeName || '';
    // Set value for select
    const pronounsSelect = document.getElementById('pronouns');
    if (pronounsSelect) pronounsSelect.value = data.pronouns || '';
    // Set value for textareas
    const studentServicesTextarea = document.getElementById('studentServices');
    if (studentServicesTextarea) studentServicesTextarea.value = data.studentServices || '';
    const collegeServiceStrengthsTextarea = document.getElementById('collegeServiceStrengths');
    if (collegeServiceStrengthsTextarea) collegeServiceStrengthsTextarea.value = data.collegeServiceStrengths || '';
    const collegeServiceImprovementsTextarea = document.getElementById('collegeServiceImprovements');
    if (collegeServiceImprovementsTextarea) collegeServiceImprovementsTextarea.value = data.collegeServiceImprovements || '';
    const workAccomplishmentsTextarea = document.getElementById('workAccomplishments');
    if (workAccomplishmentsTextarea) workAccomplishmentsTextarea.value = data.workAccomplishments || '';
    const workPerformanceStrengthsTextarea = document.getElementById('workPerformanceStrengths');
    if (workPerformanceStrengthsTextarea) workPerformanceStrengthsTextarea.value = data.workPerformanceStrengths || '';
    const workPerformanceImprovementsTextarea = document.getElementById('workPerformanceImprovements');
    if (workPerformanceImprovementsTextarea) workPerformanceImprovementsTextarea.value = data.workPerformanceImprovements || '';
    const overallNotesTextarea = document.getElementById('overallNotes');
    if (overallNotesTextarea) overallNotesTextarea.value = data.overallNotes || '';
});
});


