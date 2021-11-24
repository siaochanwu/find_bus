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
            <button class="w-6/12 bg-gray-200 text-black p-2 rounded-xl mx-5" @click="direction = 0" :class="{ 'bg-indigo-600 text-white': direction == 0 }">往{{ goWhere }}</button>
            <i class="fas fa-arrows-alt-h text-3xl text-gray-400"></i>
            <button class="w-6/12 bg-gray-200 text-black p-2 rounded-xl mx-5" @click="direction = 1" :class="{ 'bg-indigo-600 text-white': direction == 1 }">往{{ backWhere }}</button>
        </div>
        <div v-if="direction == 0" class="">
            <div v-for="item in go" :key="item.StopID" class="w-10/12 md:w-6/12 mx-auto bg-white my-2 p-3 rounded-xl text-left">
                <span class="bg-yellow-300 px-2 py-1 mx-4 rounded-full">進站中</span>
                <span class="font-bold">{{ item.StopName.Zh_tw }}</span>
            </div>
        </div>
        <div v-else>
            <div v-for="item in back" :key="item.StopID" class="w-10/12 md:w-6/12 mx-auto bg-white my-2 p-3 rounded-xl text-left">
                <span class="bg-yellow-300 px-2 py-1 mx-4 rounded-full">進站中</span>
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
            StationID: string
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

        function getEstimatedBus(country:string, routeName:string) {
            fetch(`https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/${country}/${routeName}?&format=JSON`,{
                headers: getAuthorizationHeader()
            })
            .then(res => res.json())
            .then(data => {
                console.log(data)
            })
        }

        function getBusStop(country:string, routeName:string) {
            fetch(`https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${country}/${routeName}?&format=JSON`,{
                headers: getAuthorizationHeader()
            })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                const busData = <info[]>data
                filterData.value = busData.filter(item => item.RouteName.Zh_tw == routeName)
                const aaa = filterData.value.forEach(item => {
                    //0:去程 1:返程
                    if (item.Direction == 0) {
                        for (let i = 0; i < item.Stops.length; i++) {
                            go.value.push(item.Stops[i])
                            goWhere.value = item.Stops[i].StopName.Zh_tw
                            console.log(goWhere.value)
                        }
                    } else {
                        for (let i = 0; i < item.Stops.length; i++) {
                            back.value.push(item.Stops[i])
                            backWhere.value = item.Stops[i].StopName.Zh_tw
                            console.log(backWhere.value)
                        }
                    }
                })
                console.log('go', go.value)
            })
        }

        onMounted(() => {
            getEstimatedBus(country.value, routeName.value);
            getBusStop(country.value, routeName.value);
        })

        return {
            routeName,
            country,
            go,
            back,
            filterData,
            direction,
            goWhere,
            backWhere
        }
    }
}

</script>
