// Evil-Eval: Prompt Generator

document.getElementById('eval-form').addEventListener('submit', function(e) {
    // Get and format student services as a markdown bulleted list
    let studentServicesRaw = document.getElementById('studentServices').value.trim();
    let studentServicesList = [];
    if (studentServicesRaw) {
        // Split by newlines or commas, trim, and filter out empty
        studentServicesList = studentServicesRaw.split(/\n|,/).map(s => s.trim()).filter(Boolean);
    }
    let studentServicesMarkdown = studentServicesList.length
        ? studentServicesList.map(s => `- ${s}`).join('\n')
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
        ? workAccomplishmentsList.map(s => `- ${s}`).join('\n')
        : '';
    const workPerformanceStrengths = document.getElementById('workPerformanceStrengths').value.trim();
    const workPerformanceImprovements = document.getElementById('workPerformanceImprovements').value.trim();

    // Get Overall notes
    const overallNotes = document.getElementById('overallNotes').value.trim();
    e.preventDefault();
    let employeeName = document.getElementById('employeeName').value.trim();
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
});


