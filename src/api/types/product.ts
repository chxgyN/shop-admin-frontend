export interface productNameType {
  productName: string
}

export interface checkedListType {
  checkedList: Array<string>
}

export interface editProductType {
  _id: string,
  productName: string,
  image: string,
  price: number,
  unit: string,
  inventory: number,
  inventoryCeiling: number
}

export interface getProductType {
  _id: string
}

export interface getProdectResType {
  image: string
  _id: string
  status:string
  productName: string
  price:number
  purchasePrice:number
  unit:string
  inventory:number
  inventoryCeiling:number
  __v:number
}