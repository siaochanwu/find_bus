<template>
    <div class="bg-gray-100 w-full">
        <Nav />
        <div class="bg-indigo-600 rounded-b-lg py-3 px-6">
            <div class="text-left">
                <span class="bg-blue-100 text-indigo-600 rounded-full px-2 mb-3">{{ country }}</span>
            </div>
            <div class="flex justify-between items-baseline">
                <h1 class="text-white text-3xl font-bold">{{ routeName }}</h1>
                <div class="text-white text-3xl">
                    <button><i class="fas fa-map-pin mx-2" @click="type = 'pin'"></i></button>
                    <button><i class="fas fa-info-circle mx-2" @click="type = 'info'"></i></button>
                    <button><i class="far fa-map mx-2" @click="changeType('map')"></i></button>
                </div>
            </div>
        </div>
        <div v-if="type == 'pin'">
            <div class="mt-5 w-12/12 md:w-6/12 flex mx-auto p-3 items-center">
                <button class="w-6/12 bg-gray-200 text-black p-2 rounded-xl mx-5" @click="direction = 0" :class="{ 'bg-indigo-600 text-white': direction == 0 }">往{{ backWhere }}</button>
                <i class="fas fa-arrows-alt-h text-3xl text-gray-400"></i>
                <button class="w-6/12 bg-gray-200 text-black p-2 rounded-xl mx-5" @click="direction = 1" :class="{ 'bg-indigo-600 text-white': direction == 1 }">往{{ goWhere }}</button>
            </div>
            <div v-if="direction == 0" class="">
                <div v-for="item in goWithTime" :key="item.StopID" class="w-10/12 md:w-6/12 mx-auto bg-white my-2 p-3 rounded-xl text-left">
                    <span v-if="item.EstimateTime == '尚未發車'" class="bg-gray-200 px-3 py-2 mx-4 rounded-full">{{ item.EstimateTime }}</span>
                    <span v-else-if="item.EstimateTime == '進站中'" class="bg-red-500 px-3 py-2 mx-4 rounded-full text-white">{{ item.EstimateTime }}</span>
                    <span v-else-if="item.EstimateTime == '即將進站'" class="bg-yellow-500 px-3 py-2 mx-4 rounded-full text-white">{{ item.EstimateTime }}</span>
                    <span v-else class="bg-green-300 px-3 py-2 mx-4 rounded-full">{{ item.EstimateTime }}</span>
                    <span class="font-bold">{{ item.StopName.Zh_tw }}</span>
                    <span class="font-bold">{{ item.StopUID }}</span>
                </div>
            </div>
            <div v-else>
                <div v-for="item in backWithTime" :key="item.StopID" class="w-10/12 md:w-6/12 mx-auto bg-white my-2 p-3 rounded-xl text-left">
                    <span v-if="item.EstimateTime == '尚未發車'" class="bg-gray-200 px-3 py-2 mx-4 rounded-full">{{ item.EstimateTime }}</span>
                    <span v-else-if="item.EstimateTime == '進站中'" class="bg-red-500 px-3 py-2 mx-4 rounded-full text-white">{{ item.EstimateTime }}</span>
                    <span v-else-if="item.EstimateTime == '即將進站'" class="bg-yellow-500 px-3 py-2 mx-4 rounded-full text-white">{{ item.EstimateTime }}</span>
                    <span v-else-if="item.EstimateTime == null" class="bg-gray-100 px-3 py-2 mx-4 rounded-full">末班駛離</span>
                    <span v-else class="bg-green-300 px-3 py-2 mx-4 rounded-full">{{ item.EstimateTime }}</span>
                    <span class="font-bold">{{ item.StopName.Zh_tw }}</span>
                </div>
            </div>
        </div>

        <div v-else-if="type == 'info'">
            <div class="bg-white rounded-lg w-12/12 md:w-6/12 mx-auto my-3 p-2 text-left font-bold">
                <span class="bg-yellow-400 text-indigo-600 rounded-full px-2 py-1">票價</span>
                <h2 class="my-3">一般:${{ fare[0].ODFares[0].Fares[0].Price }}</h2>
            </div>
            <div class="bg-white rounded-lg w-12/12 md:w-6/12 mx-auto my-3 p-2 text-left font-bold">
                <span class="bg-yellow-400 text-indigo-600 rounded-full px-2 py-1">平日發車資訊</span>
                <h2 class="my-3">首班車:{{ FirstLast[0].FirstLastTrips[0].FirstTripDepTime }}</h2>
                <h2>末班車:{{ FirstLast[0].FirstLastTrips[0].LastTripDepTime }}</h2>
            </div>
            <div class="bg-white rounded-lg w-12/12 md:w-6/12 mx-auto my-3 p-2 text-left font-bold">
                <span class="bg-yellow-400 text-indigo-600 rounded-full px-2 py-1">假日發車資訊</span>
                <h2 class="my-3">首班車:{{ FirstLast[0].FirstLastTrips[1].FirstTripDepTime }}</h2>
                <h2>末班車:{{ FirstLast[0].FirstLastTrips[1].LastTripDepTime }}</h2>
            </div>
        </div>

        <div v-show="type=='map'" id="map" class="h-screen"></div>

    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import jsSHA from "jssha"
import Nav from './Nav.vue'
import "leaflet/dist/leaflet.css"
import L from "leaflet"

import busInfo from '../use/busInfo'
import realtime from '../use/realtime'

        interface busStop {
            StopName: {
                Zh_tw: string
            },
            StopID: string,
            StopUID: string,
            StationID: string,
            EstimateTime: number | string,
        }
        interface busTime {
            Estimates: estimate[]
            StopUID: string,
            Direction: number,
            EstimateTime: number
        }
        interface estimate {
            PlateNumb: string
        }
        interface bus {
            plateNumb: string,
            stops: stops[]
        }
        interface stops {
            estimateTime: number,
            stopUID: string
        }

        const route = useRoute()
        const store = useStore()

        const routeName = ref<any>(route.params.routeName)
        const country = ref(store.state.country)
        const direction = ref(0)
        const busTime = ref<bus[]>([])
        const goWithTime = ref<busStop[]>([])
        const backWithTime = ref<busStop[]>([])
        const type = ref('pin')
        let map = ref<any>('')
		let markers = ref<any>(null)

        const { FirstLast, fare } = busInfo(country.value, routeName.value)
        const { go, back, goWhere, backWhere, goBusTime, backBusTime } = realtime(country.value, routeName.value)

        function getAuthorizationHeader() {
            let AppID = import.meta.env.VITE_APP_ID;
            let AppKey: any = import.meta.env.VITE_APP_KEY;

            let GMTString = new Date().toUTCString();
            let ShaObj = new jsSHA('SHA-1', 'TEXT');
            ShaObj.setHMACKey(AppKey, 'TEXT');
            ShaObj.update('x-date: ' + GMTString);
            let HMAC = ShaObj.getHMAC('B64');
            let Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';
            return { 'Authorization': Authorization, 'X-Date': GMTString }; 
        }

        //預估到站資料(桃園.台中.高雄only)
        function getEstimatedBus(country:string, routeName:string) {
            fetch(`https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/${country}/${routeName}?&format=JSON`,{
                headers: getAuthorizationHeader()
            })
            .then(res => res.json())
            .then(data => {
                // console.log(data)
                const estimateData = <busTime[]>data
                const estimate = estimateData.filter(item => item.Estimates)
                const goCache = estimate.filter(item => item.Direction == 0)
                const backCache = estimate.filter(item => item.Direction == 1)

                //找不重複的車牌(去程)
                goCache.forEach(item => {
                    const index = goBusTime.value.map(item => item.plateNumb).indexOf(item.Estimates[0].PlateNumb)

                    if(index === -1) {
                        goBusTime.value.push({
                            plateNumb: item.Estimates[0].PlateNumb,
                            stops: [{
                                estimateTime: item.EstimateTime,
                                stopUID: item.StopUID
                            }]
                        })
                    } else {
                        goBusTime.value[index].stops.push({
                            estimateTime: item.EstimateTime,
                            stopUID: item.StopUID
                        })
                    }
                })
                // console.log(goBusTime.value)

                //找不重複的車牌(回程)
                backCache.forEach(item => {
                    const index = backBusTime.value.map(item => item.plateNumb).indexOf(item.Estimates[0].PlateNumb)

                    if(index === -1) {
                        backBusTime.value.push({
                            plateNumb: item.Estimates[0].PlateNumb,
                            stops: [{
                                estimateTime: item.EstimateTime,
                                stopUID: item.StopUID
                            }]
                        })
                    } else {
                        backBusTime.value[index].stops.push({
                            estimateTime: item.EstimateTime,
                            stopUID: item.StopUID
                        })
                    }
                })
                // console.log(backBusTime.value)

                match()
            })
        }

        function match() {
            //go
            for (let i = 0; i < go.value.length; i++) {
                for (let j = 0; j < goBusTime.value.length; j++) {
                    console.log(goBusTime.value[j])
                    for (let k = 0; k < goBusTime.value[j].stops.length; k++) {
                        if (go.value[i].StopUID == goBusTime.value[j].stops[k].stopUID){
                            go.value[i].EstimateTime = goBusTime.value[j].stops[k].estimateTime / 60 + '分鐘'
                            if (goBusTime.value[j].stops[k].estimateTime / 60 == 0) {
                                go.value[i].EstimateTime = '進站中'
                            } else if (goBusTime.value[j].stops[k].estimateTime / 60 < 3) {
                                go.value[i].EstimateTime = '即將進站'
                            }
                        } else if (!go.value[i].EstimateTime){
                            go.value[i].EstimateTime = '尚未發車'
                        } else {
                            go.value[i].EstimateTime = '尚未發車'
                        }
                    }
                }
                goWithTime.value.push(go.value[i])
            }
            //back
            for (let i = 0; i < back.value.length; i++) {
                for (let j = 0; j < backBusTime.value.length; j++) {
                    for (let k = 0; k < backBusTime.value[j].stops.length; k++) {
                        if (back.value[i].StopUID == backBusTime.value[j].stops[k].stopUID){
                            back.value[i].EstimateTime = backBusTime.value[j].stops[k].estimateTime / 60 + '分鐘'
                        } else if (!back.value[i].EstimateTime){
                            back.value[i].EstimateTime = '尚未發車'
                        }
                    }
                }
                backWithTime.value.push(back.value[i])
            }
            
        }

        function changeType (item: string) {
            type.value = item
            if (type.value == 'map') {
                setMarkers()
            }
        }

        function getLocation() {
            map = L.map('map').setView([0, 0], 15)
		}
        
        function setMarkers() {
            map.remove()
            map = L.map('map').setView([go.value[10].StopPosition.PositionLat, go.value[10].StopPosition.PositionLon], 13);
            L.tileLayer(
                "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
                {
                    attribution:
                        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                    maxZoom: 18,
                    id: "mapbox/streets-v11",
                    tileSize: 512,
                    zoomOffset: -1,
                    accessToken: import.meta.env.VITE_APP_ACCESSTOKEN,
                }
            ).addTo(map);
            map.removeLayer(markers)
            markers = L.layerGroup().addTo(map)
            let marker;
            var myIcon = L.icon({ //修改marker樣式
				iconUrl: 'https://i.pinimg.com/originals/0f/61/ba/0f61ba72e0e12ba59d30a50295964871.png',
				iconSize: [38, 95],
				iconAnchor: [22, 94],
				popupAnchor: [-3, -76],
				shadowSize: [68, 95],
				shadowAnchor: [22, 94]
			});
            go.value.forEach(item => {
                marker = L.marker([item.StopPosition.PositionLat, item.StopPosition.PositionLon], {icon: myIcon}).addTo(markers)
                marker.bindPopup(`<b>${item.StopName.Zh_tw}</b>`)
                markers.addLayer(marker)
            })
            map.addLayer(markers)
        }

        onMounted(() => {
            getEstimatedBus(country.value, routeName.value);
            getLocation()
        })
</script>
