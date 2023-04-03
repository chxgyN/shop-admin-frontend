<template>
  <div
    class="products-display-container"
    style="padding: 10px 20px;"
  >
    <!-- tab -->
    <div
      class="tabs-container"
      style="display: flex; align-items: center;"
    >
      <SvgIcon
        name="cards"
        :size="24"
        :color="currentTab === 'cards' ? '#409EFF' : '#8a8a8a'"
        style="cursor: pointer;"
        @click="changeTab('cards')"
      />
      <el-divider direction="vertical" />
      <SvgIcon
        name="table"
        :size="21"
        :color="currentTab === 'table' ? '#409EFF' : '#8a8a8a'"
        style="cursor: pointer;margin-left: 2px;"
        @click="changeTab('table')"
      />
    </div>
    <!-- 筛选和操作 -->
    <div
      class="filters-and-actions-container"
      style="margin-top: 20px;display: flex;align-items: center;align-items: center;justify-content: space-between;"
    >
      <!-- 筛选 -->
      <div
        class="filters-container"
        style="display: flex;"
      >
        <el-select
          v-model="productStatusFilter"
          placeholder="请选择商品状态"
          size="small"
        >
          <el-option
            v-for="item in PRODUCT_STATUS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input
          v-model="searchText"
          style="margin-left: 20px;"
          size="small"
          placeholder="请输入商品名"
        />
      </div>
      <!-- 操作 -->
      <div
        class="actions-container"
      >
        <el-button
          size="small"
          :disabled="!isPermissions('EDIT_PRODUCT')"
          @click="showAddProductDrawer = true"
        >
          添加商品
        </el-button>
        <el-popconfirm
          v-if="currentTab === 'table'"
          title="确定删除已选商品？"
          confirm-button-text="确定"
          cancel-button-text="取消"
          @confirm="deleteSelectedProducts"
        >
          <template #reference>
            <el-button
              size="small"
              type="danger"
              :disabled="!isPermissions('EDIT_PRODUCT')"
            >
              批量删除
            </el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
    <!-- 商品内容 -->
    <div
      class="products-display-content"
      style="margin-top: 20px;"
    >
      <CardsDisplay
        v-if="currentTab === 'cards'"
        :all-filters="allFilters"
        @editProduct="handleEditProduct"
      />
      <TableDisplay
        v-if="currentTab === 'table'"
        ref="tableDisplay"
        :all-filters="allFilters"
        @editProduct="handleEditProduct"
      />
    </div>
    <!-- 添加商品 - 抽屉 -->
    <el-drawer
      v-model="showAddProductDrawer"
      :title="editingProductId ? '编辑商品' : '添加商品'"
      size="70%"
      direction="rtl"
      destroy-on-close
    >
      <el-form
        ref="AddProductForm"
        style="padding: 20px 40px 20px 20px;"
        :model="addProductForm"
        :rules="addProductFormRules"
        label-width="80px"
        label-position="left"
      >
        <el-form-item
          label="商品名"
          prop="productName"
        >
          <el-input v-model="addProductForm.productName" />
        </el-form-item>
        <el-form-item
          label="商品图片"
          prop="image"
        >
          <el-upload
            action="#"
            :before-upload="beforeProductImageUpload"
          >
            <img
              v-if="addProductForm.image"
              height="120"
              :src="addProductForm.image"
            >
            <el-button
              v-else
              size="small"
              type="primary"
            >
              点击上传
            </el-button>
            <template #tip>
              <div>
                只能上传 jpg/png 文件，且不超过 500kb
              </div>
            </template>
          </el-upload>
          <!-- <el-input v-model="addProductForm.image" /> -->
        </el-form-item>
        <el-form-item
          label="进价"
          prop="purchasePrice"
        >
          <el-input-number
            v-model="addProductForm.purchasePrice"
          />
        </el-form-item>
        <el-form-item
          label="售价"
          prop="price"
        >
          <el-input-number
            v-model="addProductForm.price"
          />
        </el-form-item>
        <el-form-item
          label="单位"
          prop="unit"
        >
          <el-input v-model="addProductForm.unit" />
        </el-form-item>
        <el-form-item
          label="库存量"
          prop="inventory"
        >
          <el-input-number
            v-model="addProductForm.inventory"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="库存上限"
          prop="inventoryCeiling"
        >
          <el-input-number
            v-model="addProductForm.inventoryCeiling"
          />
        </el-form-item>
      </el-form>
      <div
        class="drawer-footer"
        style="display: flex;justify-content: space-evenly;align-items: center;width: 50%;margin: 0 auto;"
      >
        <el-button @click="showAddProductDrawer = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click=" addCommit"
        >
          确定
        </el-button>
      </div>
    </el-drawer>
    <!-- 修改商品 - 抽屉 -->
    <el-drawer
      v-model="showEditProductDrawer"
      :title="editingProductId ? '编辑商品' : '添加商品'"
      size="70%"
      direction="rtl"
      destroy-on-close
    >
      <el-form
        ref="EditProductForm"
        style="padding: 20px 40px 20px 20px;"
        :model="editProductForm"
        :rules="editProductFormRules"
        label-width="80px"
        label-position="left"
      >
        <el-form-item
          label="商品名"
          prop="productName"
        >
          <el-input v-model="editProductForm.productName" />
        </el-form-item>
        <el-form-item
          label="商品图片"
          prop="image"
        >
          <el-upload
            action="#"
            :before-upload="beforeProductImageUpload"
          >
            <img
              v-if="editProductForm.image"
              height="120"
              :src="editProductForm.image"
            >
            <el-button
              v-else
              size="small"
              type="primary"
            >
              点击上传
            </el-button>
            <template #tip>
              <div>
                只能上传 jpg/png 文件，且不超过 500kb
              </div>
            </template>
          </el-upload>
          <!-- <el-input v-model="editProductForm.image" /> -->
        </el-form-item>
        <el-form-item
          label="进价"
          prop="purchasePrice"
        >
          <el-input-number
            v-model="editProductForm.purchasePrice"
          />
        </el-form-item>
        <el-form-item
          label="售价"
          prop="price"
        >
          <el-input-number
            v-model="editProductForm.price"
          />
        </el-form-item>
        <el-form-item
          label="单位"
          prop="unit"
        >
          <el-input v-model="editProductForm.unit" />
        </el-form-item>
        <el-form-item
          label="库存量"
          prop="inventory"
        >
          <el-input-number
            v-model="editProductForm.inventory"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="库存上限"
          prop="inventoryCeiling"
        >
          <el-input-number
            v-model="editProductForm.inventoryCeiling"
          />
        </el-form-item>
      </el-form>
      <div
        class="drawer-footer"
        style="display: flex;justify-content: space-evenly;align-items: center;width: 50%;margin: 0 auto;"
      >
        <el-button @click="showEditProductDrawer = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="editCommit"
        >
          确定
        </el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import CardsDisplay from '@/components/productsDisplay/CardsDisplay.vue'
import TableDisplay from '@/components/productsDisplay/TableDisplay.vue'
import { addProductForm, addProductFormRules } from './addProductFormModel'
import { editProductForm, editProductFormRules } from './editProductFormModel'
import { PRODUCT_STATUS } from '@/constants/constants'
import { cloneDeep } from 'lodash'
import isPermissions from '@/hook/isPermissions'

export default defineComponent({
  name: 'InventoryManagement',
  components: {
    CardsDisplay,
    TableDisplay
  },
  setup () {
    const currentTab = ref<'cards' | 'table'>('cards')
    const showAddProductDrawer = ref<boolean>(false)
    const showEditProductDrawer = ref<boolean>(false)
    const addProductFormRef = ref(addProductForm)
    const editProductFormRef = ref(editProductForm)
    const refresh = ref<boolean>(false)
    const editingProductId = ref<string | null>(null)
    const productStatusFilter = ref<string>('')
    const searchText = ref<string>('')
    // const isEdit = !isPermissions('EDIT_PRODUCT')
    return {
      currentTab,
      showAddProductDrawer,
      showEditProductDrawer,
      addProductForm: addProductFormRef,
      addProductFormRules,
      editProductForm: editProductFormRef,
      editProductFormRules,
      refresh,
      editingProductId,
      PRODUCT_STATUS,
      productStatusFilter,
      searchText,
      isPermissions
      // isEdit
    }
  },
  computed: {
    allFilters () {
      return {
        refresh: this.refresh,
        status: this.productStatusFilter,
        searchText: this.searchText
      }
    }
  },
  watch: {
    currentTab (tab: 'cards' | 'table') {
      this.$router.replace({ path: '/inventoryManagement/' + tab })
    }
  },
  mounted () {
    if (this.$route.params.tab === 'table') {
      this.currentTab = 'table'
    }
  },
  methods: {
    beforeProductImageUpload (file: any) {
      // 将上传的图片转为base64格式
      const reader = new FileReader()
      reader.onload = (e) => {
        this.addProductForm.image = e.target.result
      }
      reader.readAsDataURL(file)
      return false // 屏蔽默认上传
    },

    handleEditProduct (row: any) {
      this.showEditProductDrawer = true
      this.editProductForm = cloneDeep(row)
      this.editingProductId = row._id
    },

    async editCommit() {
      this.$refs.EditProductForm.validate(async (isValid: boolean) => {
        if (isValid) {
          let res = null
          res = await this.$api.editProduct({
            ...this.editProductForm,
            _id: this.editingProductId
          })
          // console.log("@@@"+JSON.stringify(res));
          
          this.showAddProductDrawer = false
          this.editingProductId = null
          this.refresh = !this.refresh
          this.$refs.EditProductForm.resetFields()
          
        } 
        else {
          return false
        }
      })
    },

    async addCommit () {
      this.$refs.AddProductForm.validate(async (isValid: boolean) => {
        if (isValid) {
          let res = null   
          res = await this.$api.addProduct(this.addProductForm)
          console.log(res.code);
          this.showAddProductDrawer = false
          this.editingProductId = null
          this.refresh = !this.refresh
          this.$refs.AddProductForm.resetFields()
          
        } 
        else {
          return false
        }
      })
    },

    changeTab (tab: 'cards' | 'table'): void {
      this.currentTab = tab
    },

    deleteSelectedProducts () {
      (this.$refs.tableDisplay as any).deleteSelectedProducts()
    }
  }
})
</script>

<style>

</style>
