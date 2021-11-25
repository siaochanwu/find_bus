<template>
    <div class="bg-gray-100 w-full">
        <Nav />
        <div class="bg-indigo-600 rounded-b-lg py-3 px-6">
            <p class="text-left bg-blue-100 text-indigo-600 rounded-full px-2 w-3/12 mb-3">{{ country }}</p>
            <div class="flex justify-between items-baseline">
                <h1 class="text-white text-3xl font-bold">{{ routeName }}</h1>
                <div>123</div>
            </div>
        </div>
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
                <span v-else class="bg-yellow-300 px-3 py-2 mx-4 rounded-full">{{ item.EstimateTime }}</span>
                <span class="font-bold">{{ item.StopName.Zh_tw }}</span>
                <span class="font-bold">{{ item.StopUID }}</span>
            </div>
        </div>
        <div v-else>
            <div v-for="item in backWithTime" :key="item.StopID" class="w-10/12 md:w-6/12 mx-auto bg-white my-2 p-3 rounded-xl text-left">
                <span v-if="item.EstimateTime == '尚未發車'" class="bg-gray-200 px-3 py-2 mx-4 rounded-full">{{ item.EstimateTime }}</span>
                <span v-else-if="item.EstimateTime == '進站中'" class="bg-red-500 px-3 py-2 mx-4 rounded-full text-white">{{ item.EstimateTime }}</span>
                <span v-else-if="item.EstimateTime == '即將進站'" class="bg-yellow-500 px-3 py-2 mx-4 rounded-full text-white">{{ item.EstimateTime }}</span>
                <span v-else class="bg-yellow-300 px-3 py-2 mx-4 rounded-full">{{ item.EstimateTime }}</span>
                <span class="font-bold">{{ item.StopName.Zh_tw }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import jsSHA from "jssha"
import Nav from './Nav.vue'

export default {
    components: { Nav },
    setup() {
        interface info {
            RouteName: {
                Zh_tw: string,
                
            },
            Direction: number,
            Stops: busStop[]
        }
        interface busStop {
            StopName: {
                Zh_tw: string
            },
            StopID: string,
            StopUID: string,
            StationID: string,
            EstimateTime: number | string
        }
        interface depart {
            DepartureStopNameZh: string,
            DestinationStopNameZh: string,
            RouteName: {
                Zh_tw: string
            }
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
        const go = ref<busStop[]>([])
        const goWhere = ref('')
        const back = ref<busStop[]>([])
        const backWhere = ref('')
        const filterData = ref<info[]>([])
        const direction = ref(0)
        const busTime = ref<bus[]>([])
        const goBusTime = ref<bus[]>([])
        const backBusTime = ref<bus[]>([])
        const goWithTime = ref<busStop[]>([])
        const backWithTime = ref<busStop[]>([])

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
                console.log(goBusTime.value)

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
                console.log(backBusTime.value)

                match()
            })
        }

        //站序data
        function getBusStop(country:string, routeName:string) {
            fetch(`https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${country}/${routeName}?&format=JSON`,{
                headers: getAuthorizationHeader()
            })
            .then(res => res.json())
            .then(data => {
                // console.log(data)
                const busData = <info[]>data
                filterData.value = busData.filter(item => item.RouteName.Zh_tw == routeName)
                filterData.value.forEach(item => {
                    //0:去程 1:返程
                    if (item.Direction == 0) {
                        for (let i = 0; i < item.Stops.length; i++) {
                            go.value.push(item.Stops[i])
                        }
                    } else {
                        for (let i = 0; i < item.Stops.length; i++) {
                            back.value.push(item.Stops[i])
                        }
                    }
                })
            })
        }

        //取得起始站名
        function getStartEndName(country:string, routeName:string) {
            fetch(`https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${country}/${routeName}?&format=JSON`,{
                headers: getAuthorizationHeader()
            })
            .then(res => res.json())
            .then(data => {
                // console.log(data)
                const busData = <depart[]>data
                const departData = busData.filter(item => item.RouteName.Zh_tw == routeName)
                goWhere.value = departData[0].DepartureStopNameZh
                backWhere.value = departData[0].DestinationStopNameZh
            })
        }

        function match() {
            //go
            for (let i = 0; i < go.value.length; i++) {
                for (let j = 0; j < goBusTime.value.length; j++) {
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

        onMounted(() => {
            getEstimatedBus(country.value, routeName.value);
            getBusStop(country.value, routeName.value);
            getStartEndName(country.value, routeName.value);
        })

        return {
            routeName,
            country,
            direction,
            goWhere,
            backWhere,
            busTime,
            backBusTime,
            goBusTime,
            goWithTime,
            backWithTime,
        }
    }
}

</script>
