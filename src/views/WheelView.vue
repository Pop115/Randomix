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
                            <li v-for="itemOption in options"
                                class="list-group-item d-flex justify-content-between align-items-center">{{
        itemOption
}}
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
                                placeholder="Item to add to the wheel" />
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
                        <Wheel ref="wheelComponent"></Wheel>
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

<script setup>
import { ref, onMounted } from 'vue'
import { Toast } from 'bootstrap'
import Wheel from '../components/Wheel.vue'

const itemInput = ref('')
const wheelName = ref('default')
const storedWheels = ref([]);
const toastMessage = ref('')
const wheelComponent = ref();

var options = ref([]);

function addItemToWheel() {
    var arrayItems = itemInput.value.replace(/\s/g, '').trim().split(",");
    options.value.push(...arrayItems);
    wheelComponent.value.redrawWheel();
}

function spinWheel() {
    wheelComponent.value.spin();
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
            wheelComponent.value.redrawWheel();
        }
    } catch (jsonError) {
        console.log(jsonError);
    }
}

function deleteItemFromList(item) {
    options.value.splice(options.value.indexOf(item), 1);
    wheelComponent.value.redrawWheel();
}

function showToast(message) {
    toastMessage.value = message;
    const toastLiveExample = document.getElementById('liveToast')
    const toast = new Toast(toastLiveExample)
    toast.show()
}

onMounted(() => {
    wheelComponent.value.drawRouletteWheel();
    loadItemsFromWheel("default");
});

</script>