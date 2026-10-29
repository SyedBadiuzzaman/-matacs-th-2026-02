const statusEl = document.getElementById("status");
const resultCard = document.getElementById("result-card");
const companyTitle = document.getElementById("company-title");
const badgesEl = document.getElementById("badges");
const reasonEl = document.getElementById("reason");
const jsonOutput = document.getElementById("json-output");
const downloadButton = document.getElementById("download-json");

let currentEvaluation = null;

document.querySelectorAll(".proposal-btn").forEach(button => {
    button.addEventListener("click", async () => {
        const proposalId = button.dataset.id;

        statusEl.className = "status";
        statusEl.textContent = `Evaluating Proposal ${proposalId}...`;

        resultCard.hidden = true;

        try {
            const response = await fetch("/api/evaluate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    proposal_id: proposalId
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => {
                    return { detail: response.statusText };
                });

                throw new Error(errorData.detail || "Request failed");
            }

            const data = await response.json();

            currentEvaluation = data;

            renderResult(data);

            statusEl.textContent = "Evaluation complete.";
        } catch (error) {
            statusEl.className = "status error";
            statusEl.textContent = `Error: ${error.message}. Make sure the FastAPI server is running.`;
        }
    });
});

function renderResult(data) {
    const evaluation = data.evaluation_json;

    companyTitle.textContent = `Proposal ${data.proposal_id}: ${data.company_name}`;

    reasonEl.textContent = data.reason;

    jsonOutput.textContent = JSON.stringify(evaluation, null, 2);

    badgesEl.innerHTML = "";

    if (evaluation.mandatory_pass) {
        addBadge("Mandatory: PASS", "pass");
    } else {
        addBadge("Mandatory: FAIL", "fail");
    }

    if (evaluation.total_score !== null && evaluation.total_score !== undefined) {
        addBadge(`Total Score: ${evaluation.total_score}`, "score");
    }

    if (evaluation.security_flags && evaluation.security_flags.length > 0) {
        addBadge("Security Flags", "warning");
    }

    resultCard.hidden = false;
}

function addBadge(text, className) {
    const badge = document.createElement("span");
    badge.className = `badge ${className}`;
    badge.textContent = text;
    badgesEl.appendChild(badge);
}

downloadButton.addEventListener("click", () => {
    if (!currentEvaluation) {
        return;
    }

    const jsonString = JSON.stringify(currentEvaluation.evaluation_json, null, 2);

    const blob = new Blob([jsonString], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `proposal-${currentEvaluation.proposal_id}-evaluation.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
});