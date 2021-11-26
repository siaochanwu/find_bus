import { ref, onMounted } from 'vue'
import jsSHA from "jssha";

//取得公車資訊
export default function busInfo(selectCountry, selectBus) {
	const FirstLast = ref<any>([])
	
	const getFirstLast = async () => {
		FirstLast.value = await fetchFirstLast(selectCountry, selectBus)
	}

	function fetchFirstLast(selectCountry:string, selectBus:string) {
		return new Promise((resolve, reject) => {
			fetch(`https://ptx.transportdata.tw/MOTC/v2/Bus/FirstLastTripInfo/City/${selectCountry}/${selectBus}?&format=JSON`,{
				headers: getAuthorizationHeader()
			})
			.then(res => res.json())
			.then(data => {
				resolve(data)
			}).catch(err => reject(err))
		})
		
	}

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

	const fare = ref<any>([])
	const getFare = async () => {
		fare.value = await fetchFare(selectCountry, selectBus)
	}

	function fetchFare(selectCountry:string, selectBus:string) {
		return new Promise((resolve, reject) => {
			fetch(`https://ptx.transportdata.tw/MOTC/v2/Bus/RouteFare/City/${selectCountry}/${selectBus}?&format=JSON`,{
				headers: getAuthorizationHeader()
			})
			.then(res => res.json())
			.then(data => {
				resolve(data)
			}).catch(err => reject(err))
		})
	}

	onMounted(getFirstLast)
	onMounted(getFare)

	return {
		FirstLast,
		fare
	}
}