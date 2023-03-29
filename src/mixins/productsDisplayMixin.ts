import { defineComponent } from 'vue'
import { debounce } from 'lodash'

export default defineComponent({
  props: {
    allFilters: {
      type: Object,
      default: () => {}
    }
  },
  // watch: {
  //   allFilters: {
  //     async handler () {
  //       await this.getProducts()
  //     },
  //     immediate: true
  //   }
  // },
  async created () {
    await this.getProducts()
  },
  methods: {
    getProducts: debounce(async function (pageIdx = 1) {
      // console.log(pageIdx);
      //keys 对象key组成数组
      // const filters = Object.keys(this.allFilters).reduce((res: any, key: string) => {
      //   if (key !== 'refresh' && this.allFilters[key]) {
      //     res[key] = this.allFilters[key]
      //   }
      //   return res
      // }, {})
      
      this.pagination.pageIdx = pageIdx
      this.loading = true
      const res = await this.$api.getAllProducts(this.pagination)
      console.log({...this.pagination});
      
      console.log("@@"+JSON.stringify(res));
      
      this.loading = false
      this.products = res.data
      this.pagination.total = res.total
    }, 200)
  }
})
