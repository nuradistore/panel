export const pterodactylConfig = {
  domain: (process.env.PANEL_DOMAIN || "https://panelprivatemngyaanzpanel7631.buyervps.my.id").replace(/\/$/, ""),
  apiKey: process.env.PANEL_APIKEY,
  nests: "5", 
  nestsGame: "2", // ga usah di isi, ga perlu
  egg: "15", 
  eggSamp: "16", // ga usah di isi, ga perlu
  location: "1", // location panel 
}

export const appConfig = {
  whatsappGroupLink: "https://whatsapp.com/channel/0029Valq3pQHVvThh0GDrh1w", // link group
  nameHost: "BROCK STORE", // nama host 
  feeMin: 135, //minimal fee
  feeMax: 136, // max fee 
  garansi: {
    warrantyDays: 30, // Limit hari
    replaceLimit: 5, // Limit replace/claim
  },
  pay: {
    api_key: process.env.SAKURUPIAH_APIKEY,
    api_id: process.env.SAKURUPIAH_ID,
  },
  emailSender: {
    host: "brockstore71@gmail.com", // Gmail host
    port: 587, // ga usa di ubah, ga guna 
    secure: false, // false in
    auth: {
      user: "brockstore71@gmail.com", // Gmail buat ngirim ke Gmail buyer 
      pass: process.env.GMAIL_PASSWORD, // sandi aplikasi 
    },
    from: "TIM BROCK STORE <brockstore71@gmail.com>",
  }, // ganti sendiri 
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    ownerId: process.env.TELEGRAM_OWNER_ID || "",
  },
  mongodb: {
    uri: process.env.MONGODB_URL, // url mongo mu
dbName: "Cluster0",
  },
  socialMedia: {
    whatsapp: "https://wa.me/6283112108527",
    telegram: "https://t.me/brockstoreidd",
    tiktok: "https://www.tiktok.com/@brockstoree",
    instagram: "https://www.instagram.com/nuradistore",
  }
}
