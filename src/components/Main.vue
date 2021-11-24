<template>
    <div class="bg-gray-100 h-screen w-full">
        <Nav />
        <div>
            <h1 class="my-5 text-indigo-600 text-3xl font-black">找公車</h1>
            <div class="shadow-lg rounded-xl bg-white w-11/12 md:w-5/12 mx-auto p-5 text-indigo-700 font-bold">
                <div class="">
                    <input type="radio" name="function" value="route" id="" class="mx-2">查路線
                    <input type="radio" name="function" value="step" id="" class="mx-2">查站牌
                </div>
                
                <div class="">
                    <div class="my-3">
                        <select name="" id="select" class="w-full p-3 rounded-lg bg-gray-100" v-model="selectCountry">
                            <option value="" disabled>縣市</option>
                            <option :value="item.value" v-for="item in country" :key="item.value">{{ item.name }}</option>
                        </select>
                    </div>
                    <div>
                        <input class="w-full p-2 rounded-lg bg-gray-100" type="text" placeholder="搜尋" v-model="filter">
                    </div>
                </div>
                <div class="flex flex-wrap mt-5 justify-center">
                    
                    <div class="w-3/12 m-3 p-2 bg-yellow-500 rounded-xl" v-for="item in searchBus" :key="item.RouteName.Zh_tw">
                        <router-link :to="`/route/${item.RouteName.Zh_tw}`">
                        {{ item.RouteName.Zh_tw}}
                        </router-link>
                    </div>
                  
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { useStore } from 'vuex'
import Nav from './Nav.vue';
import jsSHA from "jssha";

export default {
    components: { Nav },
    setup() {
         interface info {
            RouteName: {
                Zh_tw: string,
                
            },
        }

        const store = useStore()

        const selectCountry = ref('')
        const selectBus = ref('')
        const filter = ref('')
        const busOptions = ref<info[]>([])
        const country = ref([
			{name: "臺中市",value: "Taichung"},
			{name: "基隆市",value: "Keelung"},
			{name: "新竹縣",value: "HsinchuCounty"},
			{name: "苗栗縣",value: "MiaoliCounty"},
			{name: "彰化縣",value: "ChanghuaCounty"},
			{name: "新北市",value: "NewTaipei"},
			{name: "南投縣",value: "NantouCounty"},
			{name: "雲林縣",value: "YunlinCounty"},
			{name: "嘉義縣",value: "ChiayiCounty"},
			{name: "嘉義市",value: "Chiayi"},
			{name: "屏東縣",value: "PingtungCounty"},
			{name: "宜蘭縣",value: "YilanCounty"},
			{name: "花蓮縣",value: "HualienCounty"},
			{name: "臺東縣",value: "TaitungCounty"},
			{name: "金門縣",value: "KinmenCounty"},
			{name: "澎湖縣",value: "PenghuCounty"},
			{name: "桃園市",value: "Taoyuan"},
			{name: "臺北市",value: "Taipei"},
            {name: "臺南市",value: "Tainan"},
            {name: "高雄市",value: "Kaohsiung"},
		])

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

		function getCityBus(selectCountry:string) {
            fetch(`https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${selectCountry}?&format=JSON`,{
                headers: getAuthorizationHeader()
            })
            .then(res => res.json())
            .then(data => {
                // console.log(data)
                busOptions.value = data
            })
		}
        const searchBus = computed(() => {
            if (filter.value !== '') {
                return busOptions.value.filter(item => item.RouteName.Zh_tw.match(filter.value))
            } else {
                return busOptions.value
            }
        })

        watch(selectCountry, (newVal, oldVal) => {
            if (selectCountry.value !== '') {
                store.dispatch('SELECTCOUNTRY', selectCountry.value)
                getCityBus(selectCountry.value)
            }
        })

        return {
            selectCountry,
            selectBus,
            filter,
            searchBus,
            busOptions,
            country,
            getCityBus
        };
    },
}

</script>

<style>

</style>