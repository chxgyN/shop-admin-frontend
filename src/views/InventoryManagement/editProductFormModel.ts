import { ref } from 'vue'
import { productType } from '@/constants/types'

export const editProductForm: productType = {
  productName: '',
  image: '',
  price: 10,
  purchasePrice: 9,
  unit: '个',
  inventory: 0,
  inventoryCeiling: 5000
}

export const editProductFormRules = {
  productName: [{ required: true, message: '商品名不能为空', trigger: 'blur' }],
  inventory: [{
    validator: (rule: any, value: number, cb: any) => {
      if (value < 0) {
        cb(new Error('库存量不能为负数'))
      } else {
        const editProductFormRef = ref<productType>(editProductForm)
        if (value > editProductFormRef.value.inventoryCeiling) {
          cb(new Error('不能超过库存上限'))
        } else {
          cb()
        }
      }
    },
    trigger: 'change'
  }],
  inventoryCeiling: [{
    validator: (rule: any, value: number, cb: any) => {
      if (value < 0) {
        cb(new Error('库存上限不能为负数'))
      } else {
        cb()
      }
    },
    trigger: 'change'
  }]
}
