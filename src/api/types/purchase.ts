export interface purchaseOrderType {
  productName: string,
  purchaseQuantity: number,
}

export interface addPurchaseOrderType {
  orderId: number,
  remark: string
  items: Array<purchaseOrderType>,
  purchaserAccount: string,
  createTime: number,
  // inventoryLocation?: any,
  // name?:any
}
