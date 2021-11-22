<template>
    <div>
        <div>
            <button>去程</button>
            <button>回程</button>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import jsSHA from "jssha";

export default {
    setup() {
        const route = useRoute()
        const store = useStore()

        const routeName = ref<any>(route.params.routeName)
        const country = ref(store.state.country)
        const go = ref('')
        const back = ref('')
        const filterData = ref([])

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
                filterData.value = data.filter(item => item.RouteName.Zh_tw == routeName)
                console.log(filterData.value)
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
            filterData
        }
    }
}

</script>