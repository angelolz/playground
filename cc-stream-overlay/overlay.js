/* global vars */
let cycleNum = -1;
let cookieData = null;
let animTimeMs = 500;
let cycleTime = 15000;

$(function() {
    setupWebsocket();
});

function setupWebsocket()
{
    const ws = new WebSocket("ws://localhost:6969/ws");

    //websocket events
    ws.onopen = function() {
        console.log("connected");
    }

    ws.onmessage = function(event) {
        $("#data").html(event.data);
        console.log(event.data);
        cookieData = JSON.parse(event.data);
        if(cycleNum === -1)
        {
            changeCycle();
            updateStats();
        }
    };
}

function updateStats() {
    triggerTransitions();
    setTimeout(updateText, animTimeMs);
    changeCycle();
    setTimeout(updateStats, cycleTime);
}

function updateText() {
    const statNameElement = $("#stat-name");
    const statValueElement = $("#stat-value");

    switch(cycleNum) {
        case 0: //bank
            statNameElement.html("Cookie Bank");
            statValueElement.html(cookieData.cookies);
            break;
        case 1: //cps
            statNameElement.html("Cookies per second");
            statValueElement.html(`${cookieData.cps}/sec`);
            break;
        case 2: //prestige lv
            statNameElement.html("Prestige Level");
            statValueElement.html(cookieData.prestige_lvl);
            break;
        case 3: //sugar lumps
            statNameElement.html("Sugar lumps");
            statValueElement.html(`${cookieData.lumps} sugar lumps`);
            break;
        case 4: //clicks
            statNameElement.html("Clicks");
            statValueElement.html(cookieData.clicks);
            break;
        case 5: //clicks
            statNameElement.html("Golden Cookies Clicked");
            statValueElement.html(cookieData.gc_clicks);
            break;
    }
}

function triggerTransitions() {
    $("#stat-name").addClass("transition");
    $("#stat-value").addClass("transition");
    setTimeout(() => clearTransitions("#stat-name"), (animTimeMs * 2));
    setTimeout(() => clearTransitions("#stat-value"), (animTimeMs * 2));
}

function clearTransitions(id) {
    $(id).removeClass("transition");
}

function changeCycle()
{
    if(cycleNum === 5) {
        cycleNum = 0;
    }

    else {
        cycleNum++;
    }
}
