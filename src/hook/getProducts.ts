import { getAllProducts } from '@/api/api'
import { getProdectResType } from '@/api/types/product'
// import debounce from 'lodash/debounce'

export default async function getProducts(allFilters: any,pageIdx:number = 1){
    const filters = Object.keys(allFilters).reduce((res: any, key: string) => {
        if (key !== 'refresh' && allFilters[key]) {
          res[key] = allFilters[key]
        }
        return res
      }, {})
    const pagination = {
        total: 0,
        pageIdx: 1,
        pageSize: 6
    }
    pagination.pageIdx = pageIdx
    const res: any = await getAllProducts({
        ...filters,
        ...pagination
    })
    const products: getProdectResType = res.data
    pagination.total = res.total
    return {
        products,
        total: pagination.total,
        pageIdx:pagination.pageIdx,
        pageSize:pagination.pageSize
    }
}



