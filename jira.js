/**
    Jira content-script
*/

console.log("Jira-profis extension start.");

// profis config
PROFIS_URL = "https://profis.profinit.eu/Utilization/ActivityDetail.aspx";
PROJECT_ID = 1975;                  // KGCSB_PORTBS - Portál development - BS
PROJECT_PHASE_ID = 7433;            // NPW2 - New Public Web release 2
PROJECT_SUB_PHASE_ID_DEV = 7275;    // DEV

// app config
WORK_LOG_TAB_DELAY = 1000;

function initExtension() {
    var workLogButton = document.querySelector("li[data-id=worklog-tabpanel]");
    if(workLogButton.classList.contains('active')) {
        log("Work log tab shown, adding buttons immediately.");
        addProfisButtons();
    }

    workLogButton.addEventListener("click", function() {
        setTimeout(function() {
            addProfisButtons();
        }, WORK_LOG_TAB_DELAY);
    });
}

// initialize right away
initExtension();

function addProfisButtons() {
    var workLogList = document.querySelectorAll(".issuePanelContainer .actionContainer");
    if(workLogList.length == 0) {
        log("No logged work found!");
    }

    for(var i = 0; i < workLogList.length; i++) {
        addButtonTo(workLogList.item(i));
    }
}

function addButtonTo(workLog) {
    log("Adding button to", workLog);

    // don't add button if button is already there
    var profisLabel = "Profisu";
    if(workLog.innerText.indexOf(profisLabel) === -1) {
        workLog.innerHTML = workLog.innerHTML + `<a href="${generateProfisLink(workLog)}" class="aui-button">Vykázat v ${profisLabel}</a>`;
        generateProfisLink(workLog);
    }
}

function generateProfisLink(workLog) {
    var issue = document.querySelector(".aui-page-header-main .issue-link").getAttribute("data-issue-key");
    var summary = document.querySelector("#summary-val").innerText;
    var type = document.querySelector("#type-val").innerText.trim();
    var date = workLog.querySelector(".date").innerText;

    // conversion to profis-acceptable format DD.MM.YYYY from jira format DD/MM/YYYY HH:mm
    date = date.split(" ")[0].replace("/", ".").replace("/", ".");

    console.log("Navigating to profis with issue: ", {
        issue: issue,
        summary:summary,
        type:type,
        date:date
    });

    // string interpolation can be used, because this is chrome extension and chrome supports it
    return  `${PROFIS_URL}?DateFrom=${date}&ProjectId=${PROJECT_ID}&ProjectPhaseId=${PROJECT_PHASE_ID}&ProjectSubPhaseId=${resolveTaskType(type)}` +
            `&KeyNote=${issue}&Note=${issue}%20-%20${encodeURIComponent(summary)}`;
}

function resolveTaskType(type) {
    if(type.toLowerCase().indexOf("bug") !== -1) {
        // TODO add "bugfix" phase id, when added to profis
        return PROJECT_SUB_PHASE_ID_DEV;
    }else {
        return PROJECT_SUB_PHASE_ID_DEV;
    }
}

function log(message, arg) {
    console.log("[Jira-profis] " + message, arg);
}
