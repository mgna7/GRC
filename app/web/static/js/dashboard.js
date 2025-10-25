(() => {
    const summaryData = window.__INITIAL_SUMMARY__;
    const apiBase = `${window.location.origin}/api/v1`;
    const toastEl = document.getElementById("toast");
    const instanceList = document.getElementById("instanceList");
    const metricInstances = document.getElementById("metricTotalInstances");
    const metricControls = document.getElementById("metricTotalControls");
    const metricRisks = document.getElementById("metricTotalRisks");
    const metricWidgets = document.getElementById("metricTotalWidgets");
    const analyticsTitle = document.getElementById("analyticsTitle");
    const refreshBtn = document.getElementById("refreshAnalytics");
    const replayControlsBtn = document.getElementById("replayControls");
    const replayRisksBtn = document.getElementById("replayRisks");
    const exceptionContainer = document.getElementById("exceptionContainer");
    const timelineContainer = document.getElementById("timelineContainer");

    let currentInstanceId = summaryData.instances?.[0]?.instance_id || null;
    let controlChart;
    let riskChart;
    let complianceChart;
    let toastTimer;

    const showToast = (message, type = "info") => {
        if (!toastEl) {
            return;
        }
        toastEl.textContent = message;
        toastEl.style.background =
            type === "error"
                ? "rgba(239, 68, 68, 0.95)"
                : type === "success"
                ? "rgba(34, 197, 94, 0.95)"
                : "rgba(15, 23, 42, 0.92)";
        toastEl.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
    };

    const fetchJson = async (url, options = {}) => {
        const response = await fetch(url, {
            ...options,
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
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

    const renderSummary = (summary) => {
        metricInstances.textContent = summary.total_instances;
        metricControls.textContent = summary.total_controls;
        metricRisks.textContent = summary.total_risks;
        metricWidgets.textContent = summary.total_widgets;

        if (!instanceList) {
            return;
        }

        instanceList.querySelectorAll(".instance-card").forEach((card) => card.remove());

        summary.instances.forEach((instance) => {
            const li = document.createElement("li");
            li.className = "instance-card";
            li.dataset.instanceId = instance.instance_id;
            if (instance.instance_id === currentInstanceId) {
                li.classList.add("active");
            }
            li.innerHTML = `
                <div class="instance-card-header">
                    <span class="instance-name">${instance.instance_name}</span>
                    <span class="status-pill ${instance.is_active ? "online" : "offline"}">
                        ${instance.is_active ? "Active" : "Suspended"}
                    </span>
                </div>
                <p class="instance-url">${instance.instance_url}</p>
                <div class="instance-stats">
                    <span><strong>${instance.control_count}</strong> controls</span>
                    <span><strong>${instance.risk_count}</strong> risks</span>
                    <span><strong>${instance.widget_count}</strong> widgets</span>
                </div>
                ${
                    instance.latest_analysis_summary
                        ? `<div class="instance-meta">
                                <span class="label">${instance.latest_analysis_type?.toUpperCase() || ""} insight</span>
                                <p>${instance.latest_analysis_summary}</p>
                           </div>`
                        : ""
                }
            `;
            instanceList.appendChild(li);
        });
    };

    const buildCharts = () => {
        const controlCtx = document.getElementById("controlChart");
        const riskCtx = document.getElementById("riskChart");
        const complianceCtx = document.getElementById("complianceChart");
        if (controlCtx) {
            controlChart = new Chart(controlCtx, {
                type: "bar",
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: "Effectiveness Score",
                            data: [],
                            backgroundColor: "rgba(37, 99, 235, 0.35)",
                            borderColor: "rgba(37, 99, 235, 1)",
                            borderWidth: 1.5,
                            borderRadius: 12,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            min: 0,
                            max: 1,
                            ticks: { callback: (value) => `${Math.round(value * 100)}%` },
                        },
                    },
                },
            });
        }
        if (riskCtx) {
            riskChart = new Chart(riskCtx, {
                type: "scatter",
                data: {
                    datasets: [
                        {
                            label: "Risks",
                            data: [],
                            backgroundColor: "rgba(239, 68, 68, 0.5)",
                            borderColor: "rgba(239, 68, 68, 1)",
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            min: 0,
                            max: 1,
                            title: { display: true, text: "Likelihood" },
                        },
                        y: {
                            min: 0,
                            max: 1,
                            title: { display: true, text: "Impact" },
                        },
                    },
                },
            });
        }
        if (complianceCtx) {
            complianceChart = new Chart(complianceCtx, {
                type: "doughnut",
                data: {
                    labels: ["Healthy", "Monitor", "Exception"],
                    datasets: [
                        {
                            data: [0, 0, 0],
                            backgroundColor: [
                                "rgba(34, 197, 94, 0.5)",
                                "rgba(250, 204, 21, 0.6)",
                                "rgba(239, 68, 68, 0.6)",
                            ],
                            borderColor: [
                                "rgba(34, 197, 94, 1)",
                                "rgba(250, 204, 21, 1)",
                                "rgba(239, 68, 68, 1)",
                            ],
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    cutout: "65%",
                },
            });
        }
    };

    const renderExceptions = (exceptions) => {
        exceptionContainer.innerHTML = "";
        if (!exceptions || exceptions.items.length === 0) {
            exceptionContainer.innerHTML =
                '<p class="muted">No exceptions detected for the selected instance.</p>';
            return;
        }
        exceptions.items.forEach((item) => {
            const card = document.createElement("div");
            card.className = "exception-card";
            card.innerHTML = `
                <span class="severity">${item.severity} • ${item.category}</span>
                <h4>${item.title}</h4>
                <p>${item.description}</p>
                <p class="muted">Recommendation: ${item.recommendation}</p>
            `;
            exceptionContainer.appendChild(card);
        });
    };

    const renderTimeline = (entries) => {
        timelineContainer.innerHTML = "";
        if (!entries || entries.length === 0) {
            timelineContainer.innerHTML = '<li class="muted">No analyses have been executed yet.</li>';
            return;
        }
        entries.forEach((entry) => {
            const li = document.createElement("li");
            li.className = "timeline-item";
            li.innerHTML = `
                <h4>${entry.analysis_type.toUpperCase()} • ${entry.summary}</h4>
                <time>${new Date(entry.generated_at).toLocaleString()}</time>
            `;
            timelineContainer.appendChild(li);
        });
    };

    const updateCharts = (analytics) => {
        if (controlChart) {
            const labels = analytics.controls.distribution.map((item) => item.control_id);
            const data = analytics.controls.distribution.map((item) => item.effectiveness);
            controlChart.data.labels = labels;
            controlChart.data.datasets[0].data = data;
            controlChart.update();
        }
        if (riskChart) {
            const points = analytics.risks.map((item) => ({
                x: item.likelihood,
                y: item.impact,
                r: 6 + Math.round(item.score * 6),
                label: item.risk_id,
            }));
            riskChart.data.datasets[0].data = points;
            riskChart.update();
        }
        if (complianceChart) {
            complianceChart.data.datasets[0].data = [
                analytics.compliance.healthy,
                analytics.compliance.monitor,
                analytics.compliance.exception,
            ];
            complianceChart.update();
        }
    };

    const loadInstanceAnalytics = async (instanceId) => {
        if (!instanceId) {
            analyticsTitle.textContent = "Analytics Overview";
            exceptionContainer.innerHTML = '<p class="muted">Connect an instance to view analytics.</p>';
            return;
        }
        try {
            analyticsTitle.textContent = "Analytics • Loading...";
            const data = await fetchJson(`${apiBase}/dashboard/instances/${instanceId}/metrics`);
            analyticsTitle.textContent = `Analytics • ${data.instance_name}`;
            updateCharts(data);
            renderExceptions(data.exceptions);
            renderTimeline(data.timeline);
        } catch (error) {
            analyticsTitle.textContent = "Analytics Overview";
            showToast(error.message, "error");
        }
    };

    const refreshSummary = async () => {
        try {
            const data = await fetchJson(`${apiBase}/dashboard/summary`);
            renderSummary(data);
            showToast("Dashboard refreshed.", "success");
            if (currentInstanceId) {
                await loadInstanceAnalytics(currentInstanceId);
            }
        } catch (error) {
            showToast(error.message, "error");
        }
    };

    const replayAnalysis = async (type) => {
        if (!currentInstanceId) {
            showToast("Select an instance first.", "error");
            return;
        }
        const button = type === "controls" ? replayControlsBtn : replayRisksBtn;
        const label = button.textContent;
        button.disabled = true;
        button.textContent = "Working…";
        try {
            await fetchJson(`${apiBase}/operations/${currentInstanceId}/${type}/replay`, {
                method: "POST",
            });
            showToast(`${type === "controls" ? "Control" : "Risk"} analysis replayed.`, "success");
            await Promise.all([refreshSummary(), loadInstanceAnalytics(currentInstanceId)]);
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            button.disabled = false;
            button.textContent = label;
        }
    };

    const handleInstanceClick = (event) => {
        const card = event.target.closest(".instance-card");
        if (!card) {
            return;
        }
        const { instanceId } = card.dataset;
        currentInstanceId = instanceId;
        instanceList.querySelectorAll(".instance-card").forEach((item) => item.classList.remove("active"));
        card.classList.add("active");
        loadInstanceAnalytics(instanceId);
    };

    if (instanceList) {
        instanceList.addEventListener("click", handleInstanceClick);
    }
    if (refreshBtn) {
        refreshBtn.addEventListener("click", refreshSummary);
    }
    if (replayControlsBtn) {
        replayControlsBtn.addEventListener("click", () => replayAnalysis("controls"));
    }
    if (replayRisksBtn) {
        replayRisksBtn.addEventListener("click", () => replayAnalysis("risks"));
    }

    renderSummary(summaryData);
    buildCharts();
    if (currentInstanceId) {
        const activeCard = instanceList?.querySelector(`[data-instance-id="${currentInstanceId}"]`);
        activeCard?.classList.add("active");
        loadInstanceAnalytics(currentInstanceId);
    } else {
        exceptionContainer.innerHTML = '<p class="muted">Connect an instance to view analytics.</p>';
    }
})();
