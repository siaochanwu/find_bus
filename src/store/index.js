import { createStore } from "vuex";
export default createStore({
    state:{
        country: ''
    },
    mutations: {
        selectcountry(state, payload) {
            state.country = payload
        }
    },
    actions: {
        SELECTCOUNTRY(context, payload) {
            context.commit('selectcountry', payload)
        }
    }
})