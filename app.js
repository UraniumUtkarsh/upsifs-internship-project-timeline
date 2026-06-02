const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4XBN_Aq0OVTTNjX3JQoXDrHGTPwqY5hJM4YVZFClwNhRNBXHdiTLF8nP0jv7rbsuYCkYUZRGxf3Aa/pub?output=csv";


Papa.parse(SHEET_URL,{
download:true,
header:true,
complete:(results)=>{

const data =
results.data.filter(x=>x.Date);

buildDashboard(data);

}
});

function buildDashboard(data){

const grouped={};

data.forEach(row=>{

if(!grouped[row.Date])
grouped[row.Date]=[];

grouped[row.Date].push(row);

});

buildTimeline(grouped);

calculateProjectProgress(data);

}

function calculateProjectProgress(data){

const phases=[
"Literature Review",
"Data Collection",
"Project Planning",
"Data Cleaning",
"EDA",
"Model Development",
"Documentation"
];

const completedPhases=new Set();

data.forEach(row=>{

if(row.Status==="Completed")
completedPhases.add(row.Phase);

});

const percent=Math.round(
(completedPhases.size/phases.length)*100
);

document.getElementById(
"overallPercent"
).innerText=percent+"%";

document.getElementById(
"overallFill"
).style.width=percent+"%";

let latest=data[data.length-1];

document.getElementById(
"currentPhase"
).innerText=
latest.Phase;
}

function buildTimeline(grouped){

const timeline=
document.getElementById("timeline");

const dates=
Object.keys(grouped);

dates.forEach((date,index)=>{

const entries=
grouped[date];

let status="completed";

if(entries.some(
e=>e.Status==="Blocked"
))
status="blocked";

else if(entries.some(
e=>e.Status==="In Progress"
))
status="progress";

const node=document.createElement("div");

node.className="node";

node.innerHTML=`
<div class="circle ${status}">
</div>

<div class="date-label">
${date}
</div>
`;

node.onclick=()=>{

showDetails(
date,
entries,
status
);

};

timeline.appendChild(node);

if(index!==dates.length-1){

const line=
document.createElement("div");

line.className="line";

timeline.appendChild(line);

}

});

}

function showDetails(
date,
entries,
status
){

let badge="green";

if(status==="progress")
badge="orange";

if(status==="blocked")
badge="red";

let html=`

<h2>${date}</h2>

<br>

<div class="status ${badge}">
${status.toUpperCase()}
</div>

`;

entries.forEach(item=>{

html+=`

<div class="activity">

<h4>${item.Task}</h4>

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

document.getElementById(
"details"
).innerHTML=html;
}