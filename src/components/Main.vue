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
                        <select name="" id="select" class="w-full p-3 rounded-lg bg-gray-100">
                            <option value="">縣市</option>
                            <option value="">111</option>
                        </select>
                    </div>
                    <div>
                        <input type="text" name="" id="" placeholder="搜尋" class="w-full py-2 px-3 rounded-lg bg-gray-100">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Nav from './Nav.vue';

export default {
    setup() {
        return {};
    },
    components: { Nav }
}

</script>

<style>

</style>