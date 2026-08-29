export interface RedfingerProduct {
  productId: string
  name: string
  duration: string
  price: number
  description: string
  active: boolean
  badge?: string
}

export interface RedfingerProductWithStock extends RedfingerProduct {
  stock: number
}

export const defaultRedfingerProducts: RedfingerProduct[] = [
  {
    productId: "redfinger-vip-7d",
    name: "REDFINGER VIP 7 HARI",
    duration: "7 Hari",
    price: 100,
    description: "Redeem Code REDFINGER Cloud VIP dengan masa aktif 7 hari.",
    active: true,
    badge: "VIP 7H",
  },
  {
    productId: "redfinger-vip-30d",
    name: "REDFINGER VIP 30 HARI",
    duration: "30 Hari",
    price: 55000,
    description: "Redeem Code REDFINGER Cloud VIP dengan masa aktif 30 hari.",
    active: true,
    badge: "VIP 30H",
  },
]
