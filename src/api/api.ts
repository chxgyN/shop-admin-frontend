import http from './http/index'
import { loginDataType, registerDataType } from './types/auth'
import { productNameType, checkedListType, getProductType } from './types/product'
import { addPurchaseOrderType } from './types/purchase'
import { addSalesOrderType } from './types/sales'
import { productType } from '@/constants/types'


export const login = (data: loginDataType) => http({url: '/login', data, method: 'POST'})

export const register = (data: registerDataType) => http({url: '/register', data, method: 'POST'})

export const addProduct = (data: productType) => http({url: '/addProduct', data, method: 'POST'})

export const getAllProducts = (data: any) => http({url: '/allProducts', method: 'GET', data})

export const getProduct = (data: getProductType) => http({url: '/product', method: 'GET', data})

export const getAllProductNames = (data: any) => http({url: '/allProductNames', method: 'GET', data})

export const deleteProduct = (data: productNameType) => http({url: '/deleteProduct', method: 'DELETE', data})

export const deleteProducts = (data: checkedListType) => http({url: '/deleteProducts', method: 'DELETE', data})

export const editProduct = (data: productType) => http({url: '/editProduct', method: 'PUT', data})

export const productSuggest = (data: any) => http({url: '/productSuggest', method: 'GET', data})
// purchase
export const addPurchaseOrder = (data: addPurchaseOrderType) => http({url: '/addPurchaseOrder', method: 'POST', data})

export const deletePurchaseOrder = (data: any) => http({url: '/purchaseOrder', method: 'DELETE', data})

export const getPurchaseOrder = (data: any) => http({url: '/purchaseOrder', method: 'GET', data})

export const getAllPurchaseOrders = (data: any) => http({url: '/allPurchaseOrders', method: 'GET', data})

export const changePurchaseOrderStatus = (data: any) => http({url: '/changePurchaseOrderStatus', method: 'PUT', data})
// productInventoryChange
export const getProductInventoryChange = (data: any) => http({url: '/productInventoryChange', method: 'GET', data})
// sales
export const addSalesOrder = (data: addSalesOrderType) => http({url: '/addSalesOrder', method: 'POST', data})

export const deleteSalesOrder = (data: any) => http({url: '/salesOrder', method: 'DELETE', data})

export const getAllSalesOrders = (data: any) => http({url: '/allSalesOrders', method: 'GET', data})

export const getTotalSales = (data: any) => http({url: '/totalSales', method: 'GET', data})

export const getSalesReport = (data: any) => http({url: '/salesReport', method: 'GET', data})
// user
export const getUserInfo = (data: any) => http({url: '/userInfo', method: 'GET', data})

export const updateUserInfo = (data: any) => http({url: '/userInfo', method: 'PUT', data})

export const getUserGroups = () => http({url: '/userGroups', method: 'GET'})
// chat
// export const sendMsg = (data: any) => http({url: '/sendMsg', method: 'POST', data})

// export const getChatHistory = (data: any) => http({url: '/chatHistory', method: 'GET', data})
// userRoleChange
export const getUserRoleChangeRecords = (data: any) => http({url: '/userRoleChangeRecords', method: 'GET', data})