<script setup>
import { ref, onMounted } from 'vue'
import { Toast } from 'bootstrap'

const itemInput = ref('')
const wheelName = ref('default')
const storedWheels = ref([]);
const toastMessage = ref('')

var options = ref([]);

var startAngle = 0;
var arc = Math.PI / (options.value.length / 2);
var spinTimeout = null;

var spinArcStart = 10;
var spinAngleStart = 0;
var spinTime = 0;
var spinTimeTotal = 0;

var ctx;

function byte2Hex(n) {
    var nybHexString = "0123456789ABCDEF";
    return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
}

function RGB2Color(r, g, b) {
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function getColor(item, maxitem) {
    var phase = 0;
    var center = 128;
    var width = 127;
    var frequency = Math.PI * 2 / maxitem;

    var red = Math.sin(frequency * item + 2 + phase) * width + center;
    var green = Math.sin(frequency * item + 0 + phase) * width + center;
    var blue = Math.sin(frequency * item + 4 + phase) * width + center;

    return RGB2Color(red, green, blue);
}

function drawRouletteWheel() {
    console.log("Draw roulette");
    var canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        var outsideRadius = 200;
        var textRadius = 160;
        var insideRadius = 125;

        ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 500, 500);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctx.font = 'bold 12px Helvetica, Arial';
        for (var i = 0; i < options.value.length; i++) {
            var angle = startAngle + i * arc;
            //ctx.fillStyle = colors[i];
            ctx.fillStyle = getColor(i, options.value.length);

            ctx.beginPath();
            ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
            ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
            ctx.stroke();
            ctx.fill();

            ctx.save();
            ctx.shadowOffsetX = -1;
            ctx.shadowOffsetY = -1;
            ctx.shadowBlur = 0;
            ctx.shadowColor = "rgb(220,220,220)";
            ctx.fillStyle = "black";
            ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius,
                250 + Math.sin(angle + arc / 2) * textRadius);
            ctx.rotate(angle + arc / 2 + Math.PI / 2);
            var text = options.value[i];
            ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
            ctx.restore();
        }

        //Arrow
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.moveTo(250 - 4, 250 - (outsideRadius + 5));
        ctx.lineTo(250 + 4, 250 - (outsideRadius + 5));
        ctx.lineTo(250 + 4, 250 - (outsideRadius - 5));
        ctx.lineTo(250 + 9, 250 - (outsideRadius - 5));
        ctx.lineTo(250 + 0, 250 - (outsideRadius - 13));
        ctx.lineTo(250 - 9, 250 - (outsideRadius - 5));
        ctx.lineTo(250 - 4, 250 - (outsideRadius - 5));
        ctx.lineTo(250 - 4, 250 - (outsideRadius + 5));
        ctx.fill();
    }
}

function spin() {
    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3 + 4 * 1000;
    rotateWheel();
}

function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawRouletteWheel();
    spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
    clearTimeout(spinTimeout);
    var degrees = startAngle * 180 / Math.PI + 90;
    var arcd = arc * 180 / Math.PI;
    var index = Math.floor((360 - degrees % 360) / arcd);
    ctx.save();
    ctx.font = 'bold 30px Helvetica, Arial';
    var text = options.value[index]
    ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
    ctx.restore();
}

function easeOut(t, b, c, d) {
    var ts = (t /= d) * t;
    var tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}

function addItemToWheel() {
    var arrayItems = itemInput.value.trim().split(",");
    options.value.push(...arrayItems);
    //options.push(itemInput.value);
    redrawWheel();
    itemInput.value = "";
}

function redrawWheel() {
    arc = Math.PI / (options.value.length / 2);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawRouletteWheel();
}

function spinWheel() {
    console.log("Spin wheel");
    spin();
}

function saveItems() {
    storedWheels.value = JSON.parse(localStorage.getItem("randomixWheels"));
    if (storedWheels.value == null) {
        storedWheels.value = {};
    }
    storedWheels.value[wheelName.value] = options.value;
    localStorage["randomixWheels"] = JSON.stringify(storedWheels.value);
    showToast("Modifications saved")
}

function loadItemsFromWheel(wheelToLoad) {
    wheelName.value = wheelToLoad;
    try {
        storedWheels.value = JSON.parse(localStorage.getItem("randomixWheels"));
        if(storedWheels.value == null){
            storedWheels.value = [];
        }
        console.log("Found "+Object.keys(storedWheels.value).length+" saved lists")
        if (Object.keys(storedWheels.value).length > 0) {
            options.value = storedWheels.value[wheelToLoad];
            console.log("Found "+options.value.length+" items in list "+wheelName.value)
            redrawWheel();
        }
    } catch (jsonError) {
        console.log(jsonError);
    }
}

function deleteItemFromList(item) {
    options.value.splice(options.value.indexOf(item), 1);
    redrawWheel();
}

function showToast(message) {
    toastMessage.value = message;
    const toastLiveExample = document.getElementById('liveToast')
    const toast = new Toast(toastLiveExample)
    toast.show()
}

function onEnter() {
    addItemToWheel();
}

onMounted(() => {
    drawRouletteWheel();
    loadItemsFromWheel("default");
});

</script>

<template>

    <div class="container">

        <div class="row">

            <div class="col-4" id="configCol">
                <div class="row">
                    <div class="col">
                        <div class="input-group">
                            <input type="text" v-model="wheelName" class="form-control"
                                aria-label="Text input with dropdown button">
                            <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                                aria-expanded="false"></button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li v-for="item in (storedWheels != null ? Object.keys(storedWheels).filter(i => i != wheelName) : [])">
                                    <a @click="loadItemsFromWheel(item)" class="dropdown-item">{{ item }}</a>
                                </li>
                            </ul>
                        </div>
                        <button type="button" @click="saveItems" class="btn btn-primary">Save</button>
                    </div>
                </div>

                <div class="row">
                    <div class="col">
                        <ul class="list-group">
                            <li v-for="(itemOption, index) in options" class="list-group-item d-flex justify-content-between align-items-center roulette-item-list">
                                <span>{{itemOption}}</span>
                                <div class="minuature-color" :style="{'background-color':getColor(index, options.length)}"></div>
                                <button @click="deleteItemFromList(itemOption)" type="button"
                                    class="btn-close btn-sm delete-list-item" aria-label="Close"></button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="col-8" id="wheelCol">
                <div class="row">
                    <div class="col">
                        <div class="input-group">
                            <input type="text" v-model="itemInput" class="form-control"
                                placeholder="Item to add to the wheel" v-on:keyup.enter="onEnter" />
                            <button type="button" @click="addItemToWheel" class="btn btn-primary">Add to wheel</button>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col">
                        <button type="button" @click='spinWheel' class="btn btn-primary">Spin</button>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <!--TODO Move wheel into Wheel.vue and insert wheel component here-->
                        <canvas ref="canvas" id="canvas" width="500" height="500"></canvas>
                    </div>
                </div>

            </div>

            <div id="liveToast" class="toast position-fixed bottom-0 end-0" role="alert" aria-live="assertive"
                aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        {{ toastMessage }}
                    </div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"
                        aria-label="Close"></button>
                </div>
            </div>

        </div>
    </div>

</template>