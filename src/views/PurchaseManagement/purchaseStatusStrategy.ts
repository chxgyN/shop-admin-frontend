import isPermissions from '@/hook/isPermissions'

const strategies = {
    '未开始' : {
        canChangePurchaseStatus: () => true
    },
    '采购完成' : {
        canChangePurchaseStatus: () => isPermissions('PURCHASE_ALL') 
    },
    '入库完成' : {
        canChangePurchaseStatus: () => isPermissions('STORAGE')
    },
    '订单已完成' : {
        canChangePurchaseStatus: () => false
    }
}

export const PurchaseStatusStrategy = (nextActionName) => {
    return strategies[nextActionName] ? strategies[nextActionName].canChangePurchaseStatus() : false
}