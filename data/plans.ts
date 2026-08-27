export type PlanCategory = "panel-bot" | "admin-panel"

export type Plan = {
  id: string
  category: PlanCategory
  name: string
  memory: number
  disk: number
  cpu: number
  price: number
  description: string
  features: string[]
  popular?: boolean
}

const botFeatures = ["Private Server", "Support Node.js 20+", "Masa aktif ±1 bulan", "Garansi 30 hari", "Proteksi maling script"]

export const plans: Plan[] = [
  { id: "1gb/unli", category: "panel-bot", name: "Panel Bot 1GB Express", memory: 1025, disk: 1025, cpu: 0, price: 500, description: "Paket express untuk bot ringan dan testing.", features: botFeatures },
  { id: "2gb/unli", category: "panel-bot", name: "Panel Bot 2GB Express", memory: 2025, disk: 2025, cpu: 0, price: 9500, description: "Paket express untuk bot standar.", features: botFeatures },
  { id: "3gb/unli", category: "panel-bot", name: "Panel Bot 3GB Express", memory: 3025, disk: 3025, cpu: 0, price: 10500, description: "Paket express untuk bot yang lebih berat.", features: botFeatures },
  { id: "unlimited", category: "panel-bot", name: "Panel Bot Unlimited", memory: 0, disk: 0, cpu: 0, price: 17000, description: "Resource unlimited untuk kebutuhan bot intensif.", features: botFeatures, popular: true },
  { id: "1gb", category: "panel-bot", name: "Panel Bot 1GB", memory: 1025, disk: 1025, cpu: 40, price: 2000, description: "Cocok untuk script bot ringan.", features: botFeatures },
  { id: "1,5gb", category: "panel-bot", name: "Panel Bot 1.5GB", memory: 1525, disk: 1525, cpu: 60, price: 3000, description: "Resource ekstra untuk bot ringan.", features: botFeatures },
  { id: "2gb", category: "panel-bot", name: "Panel Bot 2GB", memory: 2025, disk: 2025, cpu: 80, price: 4000, description: "Pilihan seimbang untuk bot harian.", features: botFeatures },
  { id: "2,5gb", category: "panel-bot", name: "Panel Bot 2.5GB", memory: 2525, disk: 2525, cpu: 100, price: 5000, description: "Untuk bot dengan beban menengah.", features: botFeatures },
  { id: "3gb", category: "panel-bot", name: "Panel Bot 3GB", memory: 3025, disk: 3025, cpu: 120, price: 6000, description: "Lebih lega untuk script bot menengah.", features: botFeatures, popular: true },
  { id: "3,5gb", category: "panel-bot", name: "Panel Bot 3.5GB", memory: 3525, disk: 3525, cpu: 140, price: 7000, description: "Performa stabil untuk bot menengah.", features: botFeatures },
  { id: "4gb", category: "panel-bot", name: "Panel Bot 4GB", memory: 4025, disk: 4025, cpu: 160, price: 8000, description: "Untuk bot menengah dengan workload lebih besar.", features: botFeatures },
  { id: "4,5gb", category: "panel-bot", name: "Panel Bot 4.5GB", memory: 4525, disk: 4525, cpu: 180, price: 9000, description: "Resource besar untuk bot aktif.", features: botFeatures },
  { id: "5gb", category: "panel-bot", name: "Panel Bot 5GB", memory: 5025, disk: 5025, cpu: 200, price: 10000, description: "Untuk bot aktif dan script lebih berat.", features: botFeatures },
  { id: "5,5gb", category: "panel-bot", name: "Panel Bot 5.5GB", memory: 5525, disk: 5525, cpu: 220, price: 11000, description: "Performa tinggi untuk kebutuhan bot.", features: botFeatures },
  { id: "6gb", category: "panel-bot", name: "Panel Bot 6GB", memory: 6025, disk: 6025, cpu: 240, price: 12000, description: "Resource tinggi untuk bot multi proses.", features: botFeatures },
  { id: "6,5gb", category: "panel-bot", name: "Panel Bot 6.5GB", memory: 6525, disk: 6525, cpu: 260, price: 13000, description: "Kapasitas besar untuk workload intensif.", features: botFeatures },
  { id: "7gb", category: "panel-bot", name: "Panel Bot 7GB", memory: 7025, disk: 7025, cpu: 280, price: 14000, description: "Performa premium untuk bot berat.", features: botFeatures },
  { id: "7,5gb", category: "panel-bot", name: "Panel Bot 7.5GB", memory: 7525, disk: 7525, cpu: 300, price: 15000, description: "Resource premium untuk kebutuhan maksimal.", features: botFeatures },

  { id: "admin-normal", category: "admin-panel", name: "Admin Panel Normal", memory: 4096, disk: 10240, cpu: 100, price: 15000, description: "Paket akses admin untuk pengelolaan panel.", features: ["Akses Admin", "Private Server", "Support Node.js 20+", "Garansi 30 hari"], popular: true },
  { id: "admin-cepat", category: "admin-panel", name: "Admin Panel Premium", memory: 8192, disk: 20480, cpu: 200, price: 25000, description: "Paket admin dengan resource lebih besar dan support prioritas.", features: ["Akses Admin", "Private Server", "Support Prioritas", "Garansi 30 hari"] },
]
