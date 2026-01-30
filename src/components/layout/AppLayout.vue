<script setup lang="ts">
import LeftPanel from './LeftPanel.vue'
import MainPanel from './MainPanel.vue'
</script>

<template>
  <v-navigation-drawer permanent width="400" class="left-panel">
    <LeftPanel />
  </v-navigation-drawer>

  <v-main class="main-content">
    <MainPanel />
  </v-main>
</template>

<style scoped>
.left-panel {
  display: flex;
  flex-direction: column;
}

.main-content {
  height: 100vh;
  overflow: hidden;
}
</style>
