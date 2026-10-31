<script setup>
import ToastHost from './components/ToastHost.vue'
import ConnectionBanner from './components/ConnectionBanner.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <!-- <div v-if="authStore.Initialized"> -->
    <div>
      <ConnectionBanner />

      <RouterView v-slot="{ Component, route }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key= "route.path"/>
        </Transition>
      </RouterView>


      <ToastHost />
    </div>
</template>
