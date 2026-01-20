function saveToLocalStorage() {
    const fields = ["taskName", "idPrefix", "interval", "icon", "choreMessage"];
    fields.forEach((id) => {
        const el = document.getElementById(id);
        if (el) localStorage.setItem(id, el.value);
    });
}

function generateYaml() {
    saveToLocalStorage();

    const taskName = document.getElementById("taskName").value;
    const idPrefix = slugify(taskName);
    const interval = document.getElementById("interval").value;
    const icon = document.getElementById("icon").value;
    const choreMessage = document.getElementById("choreMessage").value;

    const yaml = `input_datetime:
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
    const fields = ["taskName", "idPrefix", "interval", "icon", "choreMessage"];
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

window.addEventListener("DOMContentLoaded", () => {
    loadFromLocalStorage();
    generateYaml();
});
