<script setup lang="ts">
import {onMounted, ref} from 'vue'
import io from 'socket.io-client'
let message = ref('hello world')
let socket: any = null
onMounted(() => {
  socket = io('http://localhost:5000')
  socket.on('connect', () => {
    console.log('connected')
  })
  socket.on('b_message', (data: any) => {
    console.log(data)
    message.value = data
  })
})
</script>

<template>
  <div>{{ message }}</div>
</template>

<style scoped></style>
