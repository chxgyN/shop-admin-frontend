<template>
  <div
    class="avatar-container"
    style="background: #fff;box-sizing: border-box;border: 1px solid #ccc;border-radius: 50%;text-align: center;display: inline-flex;align-items: center;justify-content: center;"
    :style="{width: 1.4 * size + 'px', height: 1.4 * size + 'px'}"
  >
    <SvgIcon
    name="user"
    :size="size"
    color="#8a8a8a"
    :hover-change-color="false"
    />
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'
export default defineComponent({
    name: 'UserAvatar',
    props:{
        size:{
            type:Number,
            default: 24
        }
    },
})
   
</script>
<style scoped>

</style>