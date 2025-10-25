(() => {
    const apiBase = `${window.location.origin}/api/v1`;
    const form = document.getElementById("instanceForm");
    const tableBody = document.getElementById("instanceTableBody");
    const toastEl = document.getElementById("toast");
    let toastTimer;

    const showToast = (message, type = "info") => {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.style.background =
            type === "error"
                ? "rgba(239, 68, 68, 0.95)"
                : type === "success"
                ? "rgba(34, 197, 94, 0.95)"
                : "rgba(15, 23, 42, 0.92)";
        toastEl.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3000);
    };

    const fetchJson = async (url, options = {}) => {
        const response = await fetch(url, {
            ...options,
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        });
        if (!response.ok) {
            const detail = await response.json().catch(() => ({}));
            const message = detail.detail || response.statusText || "Request failed";
            throw new Error(message);
        }
        return response.json();
    };

    const safeJson = (text) => {
        if (!text.trim()) return {};
        try {
            return JSON.parse(text);
        } catch {
            throw new Error("Metadata must be valid JSON.");
        }
    };

    const renderInstances = (instances) => {
        tableBody.innerHTML = "";
        if (!instances.length) {
            tableBody.innerHTML = `<tr><td colspan="8" class="muted">No instances connected yet.</td></tr>`;
            return;
        }
        instances.forEach((instance) => {
            const row = document.createElement("tr");
            row.dataset.instanceId = instance.id;
            row.innerHTML = `
                <td>${instance.instance_name}</td>
                <td><a href="${instance.instance_url}" target="_blank" rel="noopener">${instance.instance_url}</a></td>
                <td>
                    <span class="status-pill ${instance.is_active ? "online" : "offline"}">
                        ${instance.is_active ? "Active" : "Suspended"}
                    </span>
                </td>
                <td>${instance.control_count}</td>
                <td>${instance.risk_count}</td>
                <td>${instance.widget_count}</td>
                <td>${new Date(instance.updated_at).toLocaleString()}</td>
                <td class="table-actions">
                    <button class="secondary-btn" data-action="toggle">
                        ${instance.is_active ? "Disable" : "Enable"}
                    </button>
                    <button class="danger-btn" data-action="delete">Remove</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    const refreshInstances = async () => {
        const data = await fetchJson(`${apiBase}/servicenow`);
        renderInstances(data.items);
    };

    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const submitBtn = form.querySelector("button[type=submit]");
            const original = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Connecting...";
            try {
                const payload = {
                    instance_name: form.instance_name.value,
                    instance_url: form.instance_url.value,
                    api_user: form.api_user.value,
                    api_token: form.api_token.value,
                    metadata: safeJson(form.metadata.value),
                };
                await fetchJson(`${apiBase}/servicenow/connect`, {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                form.reset();
                await refreshInstances();
                showToast("Instance connected successfully.", "success");
            } catch (error) {
                showToast(error.message, "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = original;
            }
        });
    }

    if (tableBody) {
        tableBody.addEventListener("click", async (event) => {
            const actionBtn = event.target.closest("button[data-action]");
            if (!actionBtn) return;
            const row = actionBtn.closest("tr");
            const instanceId = row?.dataset.instanceId;
            if (!instanceId) return;

            const action = actionBtn.dataset.action;
            if (action === "toggle") {
                const enable = actionBtn.textContent.trim().toLowerCase() === "enable";
                actionBtn.disabled = true;
                actionBtn.textContent = "Updating...";
                try {
                    await fetchJson(`${apiBase}/servicenow/${instanceId}`, {
                        method: "PATCH",
                        body: JSON.stringify({ is_active: enable }),
                    });
                    await refreshInstances();
                    showToast(`Instance ${enable ? "enabled" : "disabled"}.`, "success");
                } catch (error) {
                    showToast(error.message, "error");
                }
            }
            if (action === "delete") {
                if (!confirm("Remove this instance? Associated synced data will also be deleted.")) {
                    return;
                }
                actionBtn.disabled = true;
                actionBtn.textContent = "Removing...";
                try {
                    await fetch(`${apiBase}/servicenow/${instanceId}`, {
                        method: "DELETE",
                        credentials: "same-origin",
                    });
                    await refreshInstances();
                    showToast("Instance removed.", "success");
                } catch (error) {
                    showToast(error.message, "error");
                }
            }
        });
    }

    refreshInstances().catch((error) => showToast(error.message, "error"));
})();
