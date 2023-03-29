import { getAllProducts } from '@/api/api'
import { getProdectResType } from '@/api/types/product'
// import debounce from 'lodash/debounce'

export default async function getProducts(pageIdx:number = 1){
    const pagination = {
        total: 0,
        pageIdx: 1,
        pageSize: 6
    }
    pagination.pageIdx = pageIdx
    const res: any = await getAllProducts(pagination)
    const products: getProdectResType = res.data
    pagination.total = res.total
    return {
        products,
        total: pagination.total,
        pageIdx:pagination.pageIdx,
        pageSize:pagination.pageSize
    }
}



