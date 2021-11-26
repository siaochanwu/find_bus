<template>
    <div class="mx-auto bg-white w-full">
        <nav class="md:flex md:justify-between ">
            <div class="flex justify-between p-5">
                <a href="" class="text-2xl text-indigo-600">Formosa</a>
                <p id="hamburgerbtn" class="md:hidden md:text-white" @click="toggleMenu"><i class="fas fa-bars text-2xl text-indigo-600"></i></p>
            </div>
            <ul class="hidden md:flex md:flex-row md:items-center" id="mobileMenu">
                <li class="bg-indigo-600 text-white p-3 md:mr-5 md:bg-transparent md:text-indigo-600 font-bold text-xl"><a href="">附近站牌</a></li>
                <li class="bg-indigo-600 text-white p-3 md:mr-5 md:bg-transparent md:text-indigo-600 font-bold text-xl"><a href="">轉乘規劃</a></li>
                <li class="bg-indigo-600 text-white p-3  md:px-2 md:py-1 md:mr-5 md:bg-transparent md:bg-indigo-600 font-bold text-xl md:rounded-full"><a href=""><i class="fas fa-search"></i>找公車</a></li>
            </ul>
        </nav>
    </div>
</template>

<script lang="ts">

export default {
    setup() {

        function toggleMenu() {
            document.getElementById('mobileMenu')?.classList.toggle('active')
        }

        return {
            toggleMenu
        }
    }
}

</script>

<style>
    .active{
        display: block;
    }    
</style>