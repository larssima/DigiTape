<template>
  <RouterView />
  <NavBar v-if="showNav" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'

const route = useRoute()
const showNav = computed(() => route.path !== '/callback')
</script>
