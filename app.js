const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4XBN_Aq0OVTTNjX3JQoXDrHGTPwqY5hJM4YVZFClwNhRNBXHdiTLF8nP0jv7rbsuYCkYUZRGxf3Aa/pub?output=csv";

Papa.parse(SHEET_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,

    complete: function(results) {

        const data = results.data.filter(
            row => row.Date && row.Task
        );

        buildDashboard(data);

    }
});

function buildDashboard(data){

    buildTimeline(data);

    calculateProjectProgress(data);

    buildPipeline(data);

}

function calculateProjectProgress(data){

    const masterPipeline = [
        "Problem Definition",
        "Data Collection",
        "Data Understanding",
        "Data Preprocessing",
        "Exploratory Data Analysis",
        "Feature Selection",
        "Model Development",
        "Model Evaluation",
        "Crime Prediction",
        "Visualization Dashboard",
        "Ethical AI Assessment",
        "Final Report & Presentation"
    ];

    const completedPipelines = new Set();

    data.forEach(item => {

        if(item.Status === "Completed"){

            completedPipelines.add(item.Pipeline);

        }

    });

    const percent = Math.round(
        (completedPipelines.size / masterPipeline.length) * 100
    );

    document.getElementById(
        "overallPercent"
    ).innerText = percent + "%";

    document.getElementById(
        "overallFill"
    ).style.width = percent + "%";

    const latest = data[data.length - 1];

    document.getElementById(
        "currentPhase"
    ).innerText = latest.Phase;

}

function buildTimeline(data){

    const grouped = {};

    data.forEach(item => {

        if(!grouped[item.Date]){

            grouped[item.Date] = [];

        }

        grouped[item.Date].push(item);

    });

    const timeline =
    document.getElementById("timeline");

    timeline.innerHTML = "";

    const dates = Object.keys(grouped);

    dates.forEach((date,index)=>{

        const entries = grouped[date];

        let status = "completed";

        if(entries.some(
            x => x.Status === "Blocked"
        )){
            status = "blocked";
        }
        else if(entries.some(
            x => x.Status === "In Progress"
        )){
            status = "progress";
        }

        const node =
        document.createElement("div");

        node.className = "node";

        node.innerHTML = `
            <div class="circle ${status}">
            </div>

            <div class="date-label">
                ${date}
            </div>
        `;

        node.onclick = () => {

            showDayDetails(
                date,
                entries,
                status
            );

        };

        timeline.appendChild(node);

        if(index !== dates.length - 1){

            const line =
            document.createElement("div");

            line.className = "line";

            timeline.appendChild(line);

        }

    });

}

function showDayDetails(
    date,
    entries,
    status
){

    const details =
    document.getElementById("details");

    let badge = "green";

    if(status === "progress"){
        badge = "orange";
    }

    if(status === "blocked"){
        badge = "red";
    }

    let html = `

        <h2>${date}</h2>

        <br>

        <div class="status ${badge}">
            ${status.toUpperCase()}
        </div>

        <br><br>

    `;

    entries.forEach(item => {

        html += `

        <div class="activity">

            <h4>
                ${item.Task}
            </h4>

            <p>
                ${item.Time}
                |
                ${item.Member}
            </p>

            <p>
                <b>Phase:</b>
                ${item.Phase}
            </p>

            <p>
                ${item.Remarks}
            </p>

        </div>

        `;

    });

    details.innerHTML = html;

}

function buildPipeline(data){

    const container =
    document.getElementById(
        "pipelineGrid"
    );

    const details =
    document.getElementById(
        "pipelineDetails"
    );

    if(!container) return;

    container.innerHTML = "";

    const pipelines = {};

    data.forEach(item => {

        if(!pipelines[item.Pipeline]){

            pipelines[item.Pipeline] = [];

        }

        pipelines[item.Pipeline].push(item);

    });

    const orderedPipelines = [

        "Problem Definition",

        "Data Collection",

        "Data Understanding",

        "Data Preprocessing",

        "Exploratory Data Analysis",

        "Feature Selection",

        "Model Development",

        "Model Evaluation",

        "Crime Prediction",

        "Visualization Dashboard",

        "Ethical AI Assessment",

        "Final Report & Presentation"

    ];

    orderedPipelines.forEach(pipeline => {

        const tasks =
        pipelines[pipeline] || [];

        let progress = 0;

        if(tasks.length > 0){

            const completed =
            tasks.filter(
                x => x.Status === "Completed"
            ).length;

            progress =
            Math.round(
                (completed / tasks.length) * 100
            );

        }

        let color = "gray";

        if(progress === 100){

            color = "green";

        }
        else if(progress > 0){

            color = "orange";

        }

        const card =
        document.createElement("div");

        card.className =
        "pipeline-card";

        card.innerHTML = `

            <div class="pipeline-title">

                ${pipeline}

            </div>

            <div>

                ${progress}%

            </div>

            <div class="pipeline-progress">

                <div
                class="pipeline-fill ${color}"
                style="width:${progress}%">

                </div>

            </div>

        `;

        card.onclick = () => {

            let html = `

            <div class="pipeline-details">

                <h2>${pipeline}</h2>

                <br>

                <p>
                    Progress:
                    ${progress}%
                </p>

                <br>

            `;

            if(tasks.length === 0){

                html += `
                    <p>
                    No activities logged yet.
                    </p>
                `;

            } else {

                tasks.forEach(task => {

                    html += `

                    <div class="activity">

                        <h4>
                            ${task.Task}
                        </h4>

                        <p>
                            <b>Member:</b>
                            ${task.Member}
                        </p>

                        <p>
                            <b>Date:</b>
                            ${task.Date}
                        </p>

                        <p>
                            <b>Status:</b>
                            ${task.Status}
                        </p>

                        <p>
                            ${task.Remarks}
                        </p>

                    </div>

                    `;

                });

            }

            html += `
            </div>
            `;

            details.innerHTML = html;

        };

        container.appendChild(card);

    });

}