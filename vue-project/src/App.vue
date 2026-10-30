<script setup>
import ToastHost from './components/ToastHost.vue'
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
