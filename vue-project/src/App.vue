<script setup>
import ToastHost from './components/ToastHost.vue'
// import { useAuthStore } from './stores/app'
// const authStore = useAuthStore()


</script>

<template>
  <!-- <div v-if="authStore.Initialized"> -->
  <div>
    <RouterView v-slot="{ Component, route }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" :key= "route.path"/>
      </Transition>
    </RouterView>


    <ToastHost />
  </div>
</template>
