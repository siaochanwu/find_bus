<template>
    <div>
        {{routeName}}
        {{country}}
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
            console.log('11', country)
            console.log('22', routeName)
            // fetch(`https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/${country}/${routeName}?&format=JSON`,{
            //     headers: getAuthorizationHeader()
            // })
            // .then(res => res.json())
            // .then(data => {
            //     console.log(data)
            // })
        }

        onMounted(() => {
            getEstimatedBus(country, routeName)
        })

        return {
            routeName,
            country
        }
    }
}

</script>