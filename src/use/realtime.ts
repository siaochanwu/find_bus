import { ref, onMounted } from 'vue'
import jsSHA from "jssha";

export default function realtime(selectCountry, selectBus) {
    interface info {
        RouteName: {
            Zh_tw: string,
            
        },
        Direction: number,
        Stops: busStop[],
    }
    interface busStop {
        StopName: {
            Zh_tw: string
        },
        StopID: string,
        StopUID: string,
        StationID: string,
        EstimateTime: number | string,
        [propName: string]: any; //允許有任意屬性
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

    const filterData = ref<any>([])
    const go = ref<busStop[]>([])
    const back = ref<busStop[]>([])

    const getStops = async () => {
        filterData.value = await fetchBusStop(selectCountry, selectBus)
        await filterData.value.forEach(item => {
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
    }

    function fetchBusStop(country:string, routeName:string) {
        return new Promise((resolve, reject) => {
            fetch(`https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${country}/${routeName}?&format=JSON`,{
                headers: getAuthorizationHeader()
            })
            .then(res => res.json())
            .then(data => {
                const busData = <info[]>data
                const filter = busData.filter(item => item.RouteName.Zh_tw == routeName)
                resolve(filter)
            }).catch(err => reject(err))
        })
    }

    interface depart {
        DepartureStopNameZh: string,
        DestinationStopNameZh: string,
        RouteName: {
            Zh_tw: string
        }
    }

    const departData = ref<any>([])
    let goWhere = ref(null)
    let backWhere = ref('')

    const getStarEndtName = async () => {
        departData.value = await fetchStartEndName(selectCountry, selectBus)
        goWhere.value = await departData.value[0].DepartureStopNameZh
        backWhere.value = await departData.value[0].DestinationStopNameZh
    }

    function fetchStartEndName(country:string, routeName:string) {
        return new Promise((resolve, reject) => {
            fetch(`https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${country}/${routeName}?&format=JSON`,{
                headers: getAuthorizationHeader()
            })
            .then(res => res.json())
            .then(data => {
                // console.log(data)
                const busData = <depart[]>data
                const departData = busData.filter(item => item.RouteName.Zh_tw == routeName)
                resolve(departData)
            }).catch(err => reject(err))
        })
    }

    interface bus {
        plateNumb: string,
        stops: stops[]
    }
    interface stops {
        estimateTime: number,
        stopUID: string
    }

    const goBusTime = ref<bus[]>([])
    const backBusTime = ref<bus[]>([])

	onMounted(getStops)
    onMounted(getStarEndtName)

	return {
        go,
        back,
        goWhere,
        backWhere,
        goBusTime,
        backBusTime,
	}
}