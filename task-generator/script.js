function saveToLocalStorage() {
    const fields = ["taskName", "interval", "icon", "choreMessage"];
    fields.forEach((id) => {
        const el = document.getElementById(id);
        if (el) localStorage.setItem(id, el.value);
    });
}

function generateYamlContent(taskName, interval, icon, choreMessage) {
    const idPrefix = slugify(taskName);

    return `input_datetime:
    ${idPrefix}_last:
        name: Last ${taskName}
        has_date: true
        has_time: false

input_number:
    ${idPrefix}_interval:
        name: ${taskName} Interval (days)
        min: 1
        max: 365
        step: 1
        unit_of_measurement: days
        initial: ${interval}

input_boolean:
    ${idPrefix}_enabled:
        name: ${taskName} Enabled
        icon: mdi:${icon}

input_text:
    ${idPrefix}_message:
        name: ${taskName} Notification
        initial: "${choreMessage}"

input_button:
    ${idPrefix}_done:
        name: ${taskName} Done
        icon: mdi:${icon}

automation:
    - alias: Chores - ${taskName} Done
      mode: single
      trigger:
        - platform: state
          entity_id: input_button.${idPrefix}_done
      action:
        - service: input_datetime.set_datetime
          target:
            entity_id: input_datetime.${idPrefix}_last
          data:
            date: "{{ now().date() }}"

template:
    - sensor:
          - name: "${taskName} Days Since"
            unit_of_measurement: "days"
            state: >
                {% set dt = states('input_datetime.${idPrefix}_last') %}
                {% if dt not in ('unknown','unavailable','') %}
                  {{ ((as_timestamp(now()) - as_timestamp(dt)) / 86400) | round(0) }}
                {% else %}
                  0
                {% endif %}

          - name: "${taskName} Overdue"
            state: >
                {{ states('sensor.${slugify(taskName + " Days Since")}') | int
                   > states('input_number.${idPrefix}_interval') | int }}
            icon: mdi:alert-circle
`;
}

function generateYaml() {
    saveToLocalStorage();

    const taskName = document.getElementById("taskName").value;
    const interval = document.getElementById("interval").value;
    const icon = document.getElementById("icon").value;
    const choreMessage = document.getElementById("choreMessage").value;

    const yaml = generateYamlContent(taskName, interval, icon, choreMessage);
    document.getElementById("output").value = yaml;
}

function copyToClipboard() {
    const output = document.getElementById("output");
    const copyButton = document.getElementById("copyButton");

    navigator.clipboard
        .writeText(output.value)
        .then(() => {
            copyButton.textContent = "Copied!";
            setTimeout(() => {
                copyButton.textContent = "Copy to Clipboard";
            }, 2000); // Revert back to original text after 2 seconds
        })
        .catch((err) => {
            console.error("Failed to copy text: ", err);
            copyButton.textContent = "Failed to copy";
        });
}

function loadFromLocalStorage() {
    const fields = ["taskName", "interval", "icon", "choreMessage"];
    fields.forEach((id) => {
        const el = document.getElementById(id);
        const savedValue = localStorage.getItem(id);
        if (el && savedValue) {
            el.value = savedValue;
        }
    });
}

function slugify(name) {
    return name
        .toLowerCase() // lowercase
        .trim() // remove leading/trailing spaces
        .replace(/\s+/g, "_") // replace spaces with underscores
        .replace(/[^\w_]+/g, "_"); // remove non-word characters except underscore
}

function downloadFile(filename, content) {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/yaml;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function processBulkTasks() {
    const bulkTasks = document.getElementById("bulkTasks").value.trim();
    const generatedFilesDiv = document.getElementById("generatedFiles");
    generatedFilesDiv.innerHTML = "<h4>Generated Files:</h4>";

    if (bulkTasks === "") {
        generatedFilesDiv.innerHTML += "<p>No tasks entered.</p>";
        return;
    }

    const lines = bulkTasks.split("\n");
    lines.forEach((line) => {
        const parts = line.split("|").map((part) => part.trim());
        if (parts.length < 4) {
            generatedFilesDiv.innerHTML += `<p class="text-danger">Skipping invalid line: ${line}</p>`;
            return;
        }

        const [taskName, interval, icon, choreMessage, customFilename] = parts;
        const yamlContent = generateYamlContent(taskName, interval, icon, choreMessage);
        const filename = customFilename || `${slugify(taskName)}.yaml`;

        downloadFile(filename, yamlContent);

        const fileLink = document.createElement("a");
        fileLink.href = "data:text/yaml;charset=utf-8," + encodeURIComponent(yamlContent);
        fileLink.download = filename;
        fileLink.textContent = filename;
        fileLink.classList.add("d-block");
        generatedFilesDiv.appendChild(fileLink);
    });
}

window.addEventListener("DOMContentLoaded", () => {
    loadFromLocalStorage();
    generateYaml();
    document.getElementById("processBulk").addEventListener("click", processBulkTasks);
});
