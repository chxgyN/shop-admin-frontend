<template>
  <svg
    class="svg-icon"
    :style="{
      width: props.size + 'px',
      height: props.size + 'px',
      color: iconColor
    }"
    @mouseenter="hoverChangeColor && (iconColor = props.hoverColor)"
    @mouseleave="hoverChangeColor && (iconColor = props.color)"
  >
    <use
      :xlink:href="`#icon-${props.name}`"
      :fill="iconColor"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent, toRef, ref, watch } from 'vue'

export default defineComponent({
  name: 'SvgIcon',
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 24
    },
    color: {
      type: String,
      default: '#000'
    },
    hoverColor: {
      type: String,
      default: '#B3C0D1'
    },
    hoverChangeColor: {
      type: Boolean,
      default: true
    }
  },
  setup (props) {
    // props是一个proxy对象 props.color 是一个字符串，没有引用式 此时形成代理
    const color = toRef(props, 'color')
    // 通过color的值创造新的ref对象
    const iconColor = ref(color.value)
    // 不相同
    // console.log(color === iconColor);
    
    watch(color, (newColor: string) => {
      iconColor.value = newColor
    })

    return {
      props,
      iconColor
    }
  }
})
</script>
