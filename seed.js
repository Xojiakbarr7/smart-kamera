const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

// Simple password hashing without bcrypt
function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "salt").digest("hex");
}

function serializeImages(images) {
  return JSON.stringify(images);
}

function serializeFeatures(features) {
  return JSON.stringify(features);
}

function serializeSpecs(specs) {
  return JSON.stringify(specs);
}

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const hashedPassword = hashPassword("admin123");
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@securecam.uz" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@securecam.uz",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create categories
  const categoriesData = [
    { name: "IP kameralar", slug: "ip-kameralar", description: "Tarmoq (IP) kuzatuv kameralari", order: 1 },
    { name: "WiFi kameralar", slug: "wifi-kameralar", description: "Simlarsiz WiFi kuzatuv kameralari", order: 2 },
    { name: "4G kameralar", slug: "4g-kameralar", description: "4G SIM-karta bilan ishlovchi kameralari", order: 3 },
    { name: "AHD kameralar", slug: "ahd-kameralar", description: "Analog high definition kameralar", order: 4 },
    { name: "NVR yozuvchilar", slug: "nvr-yozuvchilar", description: "Network Video Recorder qurilmalari", order: 5 },
    { name: "Aksessuarlar", slug: "aksessuarlar", description: "Kamera aksessuarlari va zapchastlari", order: 6 },
  ];

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );
  console.log("✅ Categories created:", categories.length);

  // Create brands
  const brandsData = [
    { name: "Hikvision", slug: "hikvision", description: "Dunyo yetakchisi kuzatuv tizimlari", website: "https://www.hikvision.com" },
    { name: "Dahua", slug: "dahua", description: "Video kuzatuv yechimlari bo'yicha global lider", website: "https://www.dahuatechnology.com" },
    { name: "Ezviz", slug: "ezviz", description: "Uy va biznes uchun aqlli xavfsizlik", website: "https://www.ezviz.com" },
    { name: "Tapo", slug: "tapo", description: "TP-Link brendidagi aqlli uy kameralari", website: "https://www.tapo.com" },
    { name: "Xiaomi", slug: "xiaomi", description: "Aqlli uy texnologiyalari", website: "https://www.mi.com" },
    { name: "Reolink", slug: "reolink", description: "Simli va simsiz kameralar mutaxassisi", website: "https://reolink.com" },
  ];

  const brands = await Promise.all(
    brandsData.map((brand) =>
      prisma.brand.upsert({
        where: { slug: brand.slug },
        update: {},
        create: brand,
      })
    )
  );
  console.log("✅ Brands created:", brands.length);

  // Create sample products
  const productsData = [
    {
      name: "Hikvision DS-2CD2143G0-I",
      slug: "hikvision-ds-2cd2143g0-i",
      description: "4MP IP kubik kuzatuv kamerasi, IR 30m, H.265+, PoE, IP67",
      shortDesc: "4MP IP kubik kamera, IR 30m, H.265+, PoE, IP67",
      price: 450000,
      oldPrice: 520000,
      sku: "HIK-DS2CD2143G0I",
      stock: 25,
      isActive: true,
      isFeatured: true,
      isNew: true,
      images: serializeImages([
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
        "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&q=80",
      ]),
      features: serializeFeatures(["4MP (2688 × 1520) rezolyutsiya", "IR yoritish masofasi 30m", "H.265+ codec qo'llab-quvvatlash", "PoE (Power over Ethernet)", "IP67 suv va changdan himoya", "120dB WDR"]),
      specifications: serializeSpecs([
        { name: "Sensori", value: '1/2.7" Progressive Scan CMOS' },
        { name: "Rezolyutsiya", value: "4MP (2688 × 1520)" },
        { name: "Lins", value: "2.8mm / 4mm" },
        { name: "IR masofa", value: "30m" },
        { name: "Kodek", value: "H.265+/H.265/H.264+/H.264" },
        { name: "Quwatlantirish", value: "12V DC / PoE (802.3af)" },
        { name: "Ishlab turish temper", value: "-30°C ~ +60°C" },
        { name: "Himoya darajasi", value: "IP67" },
      ]),
      categoryId: categories[0].id,
      brandId: brands[0].id,
    },
    {
      name: "Dahua DH-IPC-HDW2431T-AS-S2",
      slug: "dahua-dh-ipc-hdw2431t-as-s2",
      description: "4MP IP kubik kuzatuv kamerasi, IR 50m, WDR, PoE, IP67, Mikrofon",
      shortDesc: "4MP IP kubik kamera, IR 50m, WDR, PoE, IP67, Mikrofon",
      price: 480000,
      oldPrice: 550000,
      sku: "DAH-IPC-HDW2431T",
      stock: 18,
      isActive: true,
      isFeatured: true,
      isNew: false,
      images: serializeImages([
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
        "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&q=80",
      ]),
      features: serializeFeatures(["4MP rezolyutsiya", "50m IR masofa", "Dahiliy mikrofon", "120dB WDR", "IP67 himoya", "PoE"]),
      specifications: serializeSpecs([
        { name: "Sensori", value: '1/2.7" CMOS' },
        { name: "Rezolyutsiya", value: "4MP (2688 × 1520)" },
        { name: "Lins", value: "2.8mm" },
        { name: "IR masofa", value: "50m" },
        { name: "Audio", value: "Dahiliy mikrofon" },
        { name: "Kodek", value: "H.265/H.264" },
        { name: "Quwatlantirish", value: "12V DC / PoE" },
        { name: "Himoya", value: "IP67" },
      ]),
      categoryId: categories[0].id,
      brandId: brands[1].id,
    },
    {
      name: "Ezviz C6CN 2MP WiFi",
      slug: "ezviz-c6cn-2mp-wifi",
      description: "2MP WiFi kubik kuzatuv kamerasi, 360° aylanish, IR 10m, 2.4GHz WiFi",
      shortDesc: "2MP WiFi kubik kamera, 360° aylanish, IR 10m, 2.4GHz WiFi",
      price: 280000,
      oldPrice: 320000,
      sku: "EZV-C6CN-2MP",
      stock: 35,
      isActive: true,
      isFeatured: false,
      isNew: true,
      images: serializeImages([
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
        "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&q=80",
      ]),
      features: serializeFeatures(["2MP Full HD", "360° panoramik ko'rinish", "WiFi 2.4GHz", "IR 10m", "Mikrofon va dinamik", "MicroSD 256GB gacha"]),
      specifications: serializeSpecs([
        { name: "Rezolyutsiya", value: "2MP (1920 × 1080)" },
        { name: "Ko'rinish burchagi", value: "360° gorizontal, 110° vertikal" },
        { name: "WiFi", value: "2.4GHz IEEE 802.11b/g/n" },
        { name: "IR masofa", value: "10m" },
        { name: "Saqlash", value: "MicroSD 256GB" },
        { name: "Audio", value: "2-yo'nalishli" },
        { name: "Quwatlantirish", value: "5V DC / 1A" },
      ]),
      categoryId: categories[1].id,
      brandId: brands[2].id,
    },
    {
      name: "Tapo C200 360° WiFi Kamera",
      slug: "tapo-c200-360-wifi",
      description: "2MP WiFi kubik kuzatuv kamerasi, 360° aylanish, kunduzgi/tunigi rejim, IR 9m",
      shortDesc: "2MP WiFi kubik kamera, 360° aylanish, kunduzgi/tunigi rejim, IR 9m",
      price: 220000,
      oldPrice: 260000,
      sku: "TP-LINK-TAPO-C200",
      stock: 50,
      isActive: true,
      isFeatured: true,
      isNew: false,
      images: serializeImages([
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
        "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&q=80",
      ]),
      features: serializeFeatures(["2MP 1080p", "360° gorizontal aylanish", "Kunduzgi/tunigi rejim", "IR 9m", "Havo oqimi sensorlari", "Tapo ilovasi orqali boshqaruv"]),
      specifications: serializeSpecs([
        { name: "Rezolyutsiya", value: "2MP (1920 × 1080)" },
        { name: "Aylanish", value: "360° gorizontal, 114° vertikal" },
        { name: "WiFi", value: "2.4GHz" },
        { name: "IR", value: "9m" },
        { name: "Sensorlar", value: "Havo oqimi, harakat" },
        { name: "Saqlash", value: "MicroSD 128GB" },
        { name: "Quwatlantirish", value: "5V DC" },
      ]),
      categoryId: categories[1].id,
      brandId: brands[3].id,
    },
    {
      name: "Reolink Go Plus 4G",
      slug: "reolink-go-plus-4g",
      description: "4MP 4G LTE kuzatuv kamerasi, batareya, solar panel, sim-karta slot, IP65",
      shortDesc: "4MP 4G LTE kamera, batareya, solar panel, sim-karta slot, IP65",
      price: 850000,
      oldPrice: 950000,
      sku: "REO-GO-PLUS-4G",
      stock: 12,
      isActive: true,
      isFeatured: true,
      isNew: true,
      images: serializeImages([
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
        "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&q=80",
      ]),
      features: serializeFeatures(["4MP 2K rezolyutsiya", "4G LTE (SIM-karta)", "Batareya + Solar panel", "Sim-karta slot", "IP65 himoya", "PIR harakat sensori", "2-yo'nalishli audio"]),
      specifications: serializeSpecs([
        { name: "Rezolyutsiya", value: "4MP (2560 × 1440)" },
        { name: "Tarmoq", value: "4G LTE / 3G" },
        { name: "Batareya", value: "7800mAh li-ion" },
        { name: "Solar panel", value: "Qoshimcha (alohida sotiladi)" },
        { name: "IR", value: "10m" },
        { name: "PIR sensor", value: "10m, 120°" },
        { name: "Saqlash", value: "MicroSD 128GB / Cloud" },
        { name: "Himoya", value: "IP65" },
      ]),
      categoryId: categories[2].id,
      brandId: brands[5].id,
    },
    {
      name: "Hikvision DS-2CE16D0T-IRPF",
      slug: "hikvision-ds-2ce16d0t-irpf",
      description: "2MP AHD kubik kuzatuv kamerasi, IR 20m, 3.6mm lins, IP67",
      shortDesc: "2MP AHD kubik kamera, IR 20m, 3.6mm lins, IP67",
      price: 150000,
      oldPrice: 180000,
      sku: "HIK-DS2CE16D0T",
      stock: 40,
      isActive: true,
      isFeatured: false,
      isNew: false,
      images: serializeImages([
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
        "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&q=80",
      ]),
      features: serializeFeatures(["2MP AHD", "IR 20m", "3.6mm lins", "IP67", "UTC boshqaruv", "4-videoturkum uygunligi"]),
      specifications: serializeSpecs([
        { name: "Rezolyutsiya", value: "2MP (1920 × 1080)" },
        { name: "Video turkum", value: "AHD / TVI / CVI / CVBS" },
        { name: "Lins", value: "3.6mm" },
        { name: "IR masofa", value: "20m" },
        { name: "Quwatlantirish", value: "12V DC" },
        { name: "Himoya", value: "IP67" },
        { name: "Temperatura", value: "-40°C ~ +60°C" },
      ]),
      categoryId: categories[3].id,
      brandId: brands[0].id,
    },
    {
      name: "Dahua NVR4108HS-8P-4KS2",
      slug: "dahua-nvr4108hs-8p-4ks2",
      description: "8-kanalli NVR, 8-port PoE, 4K dekodlash, H.265+, 2x SATA, HDMI/VGA",
      shortDesc: "8-kanalli NVR, 8-port PoE, 4K dekodlash, H.265+, 2x SATA",
      price: 1200000,
      oldPrice: 1400000,
      sku: "DAH-NVR4108HS-8P",
      stock: 8,
      isActive: true,
      isFeatured: true,
      isNew: false,
      images: serializeImages([
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
        "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&q=80",
      ]),
      features: serializeFeatures(["8 kanal IP kamera", "8-port PoE (802.3af/at)", "4K (8MP) dekodlash", "H.265+/H.265", "2x SATA (10TB gacha)", "HDMI/VGA chiqishi", "ONVIF uygun"]),
      specifications: serializeSpecs([
        { name: "Kanal soni", value: "8" },
        { name: "PoE portlari", value: "8 (802.3af/at)" },
        { name: "Dekodlash", value: "4K @30fps / 8MP" },
        { name: "Kodek", value: "H.265+/H.265/H.264" },
        { name: "Saqlash", value: "2x SATA, 10TB gacha" },
        { name: "Chiqish", value: "HDMI (4K), VGA" },
        { name: "Tarmoq", value: "1x RJ45 10/100/1000M" },
        { name: "Quwatlantirish", value: "DC 48V/2A" },
      ]),
      categoryId: categories[4].id,
      brandId: brands[1].id,
    },
    {
      name: "Hikvision DS-7608NI-K2/8P",
      slug: "hikvision-ds-7608ni-k2-8p",
      description: "8-kanalli NVR, 8-port PoE, H.265+, 2x SATA, 4K live view",
      shortDesc: "8-kanalli NVR, 8-port PoE, H.265+, 2x SATA, 4K live view",
      price: 1100000,
      oldPrice: 1250000,
      sku: "HIK-DS7608NI-K2-8P",
      stock: 10,
      isActive: true,
      isFeatured: false,
      isNew: false,
      images: serializeImages([
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
        "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&q=80",
      ]),
      features: serializeFeatures(["8 kanal", "8-port PoE", "H.265+", "2x SATA", "4K live view", "Hik-Connect cloud"]),
      specifications: serializeSpecs([
        { name: "Kanal soni", value: "8" },
        { name: "PoE", value: "8 port (802.3af/at)" },
        { name: "Kodek", value: "H.265+/H.265/H.264" },
        { name: "Saqlash", value: "2x SATA (10TB)" },
        { name: "Chiqish", value: "HDMI/VGA" },
        { name: "Tarmoq", value: "1x Gigabit Ethernet" },
        { name: "Quwatlantirish", value: "48V DC" },
      ]),
      categoryId: categories[4].id,
      brandId: brands[0].id,
    },
    {
      name: "Kamera o'rnatish bracket (L-shakli)",
      slug: "camera-bracket-l-shape",
      description: "Universal L-shakli kamera o'rnatish bracket'i, metall, qora rang",
      shortDesc: "Universal L-shakli bracket, metall, qora rang",
      price: 25000,
      oldPrice: 35000,
      sku: "ACC-BRACKET-L-BLK",
      stock: 100,
      isActive: true,
      isFeatured: false,
      isNew: false,
      images: serializeImages([
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
      ]),
      features: serializeFeatures(["Universal moslik", "Metall korpus", "Qora rang", "Oson o'rnatish", "Chidamlidir"]),
      specifications: serializeSpecs([
        { name: "Material", value: "Metall" },
        { name: "Rang", value: "Qora" },
        { name: "Tur", value: "L-shakli" },
        { name: "Yuk ko'tarish", value: "3kg gacha" },
      ]),
      categoryId: categories[5].id,
      brandId: brands[0].id,
    },
    {
      name: "PoE injektor 48V 30W",
      slug: "poe-injector-48v-30w",
      description: "PoE injektor 48V 30W, IEEE 802.3af/at standarti, 1 port",
      shortDesc: "PoE injektor 48V 30W, IEEE 802.3af/at, 1 port",
      price: 85000,
      oldPrice: 100000,
      sku: "ACC-POE-INJ-48V30W",
      stock: 30,
      isActive: true,
      isFeatured: false,
      isNew: true,
      images: serializeImages([
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
      ]),
      features: serializeFeatures(["IEEE 802.3af/at", "48V 30W", "1 port", "Plug & Play", "Kichik o'lcham"]),
      specifications: serializeSpecs([
        { name: "Standart", value: "IEEE 802.3af/at" },
        { name: "Chiqish quvvati", value: "48V / 0.63A (30W)" },
        { name: "Portlar", value: "1x Data In, 1x Data+Power Out" },
        { name: "Kabel masofa", value: "100m gacha" },
        { name: "Indikatorlar", value: "Power, PoE" },
      ]),
      categoryId: categories[5].id,
      brandId: brands[0].id,
    },
    {
      name: "MicroSD karta 128GB (Class 10, U3, V30)",
      slug: "microsd-128gb-class10-u3",
      description: "Yuqori tezlikli MicroSD karta 128GB, kameralar uchun ideal, 4K video yozish",
      shortDesc: "MicroSD 128GB Class 10/U3/V30, 4K video yozish uchun",
      price: 120000,
      oldPrice: 150000,
      sku: "ACC-MICROSD-128GB-U3",
      stock: 60,
      isActive: true,
      isFeatured: true,
      isNew: false,
      images: serializeImages([
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
      ]),
      features: serializeFeatures(["128GB hajmi", "Class 10 / U3 / V30", "4K video yozish", "Yuqori barqarorlik", "Kamera uchun optimallashtirilgan"]),
      specifications: serializeSpecs([
        { name: "Hajmi", value: "128GB" },
        { name: "Sinfi", value: "Class 10, UHS-I U3, V30" },
        { name: "O'qish tezligi", value: "100 MB/s gacha" },
        { name: "Yozish tezligi", value: "90 MB/s gacha" },
        { name: "Uygunlik", value: "IP kameralar, NVR, action kameralar" },
      ]),
      categoryId: categories[5].id,
      brandId: brands[0].id,
    },
    {
      name: "Xiaomi Mi 360° Home Security Camera 2K",
      slug: "xiaomi-mi-360-home-security-2k",
      description: "2K rezolyutsiya, 360° panoramik, AI harakat aniqlash, Google Assistant/Alexa",
      shortDesc: "2K, 360° panoramik, AI harakat aniqlash, Google Assistant/Alexa",
      price: 320000,
      oldPrice: 380000,
      sku: "XIA-MI-360-2K",
      stock: 22,
      isActive: true,
      isFeatured: true,
      isNew: true,
      images: serializeImages([
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
        "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&q=80",
      ]),
      features: serializeFeatures(["2K (2304 × 1296)", "360° panoramik", "AI harakat aniqlash", "Google Assistant/Alexa", "IR 9m", "Mi Home ilovasi"]),
      specifications: serializeSpecs([
        { name: "Rezolyutsiya", value: "2K (2304 × 1296)" },
        { name: "Ko'rinish", value: "360° gorizontal, 108° vertikal" },
        { name: "AI", value: "Odil aniqlash, ovqatlanish vaqtini aniqlash" },
        { name: "Audio", value: "2-yo'nalishli" },
        { name: "IR", value: "9m" },
        { name: "WiFi", value: "2.4GHz / 5GHz" },
        { name: "Saqlash", value: "MicroSD 32GB / NAS / Cloud" },
        { name: "Quwatlantirish", value: "5V / 2A (USB-C)" },
      ]),
      categoryId: categories[1].id,
      brandId: brands[4].id,
    },
    {
      name: "Dahua DH-HAC-HFW1200RP-Z-A",
      slug: "dahua-dh-hac-hfw1200rp-z-a",
      description: "2MP AHD oqsilindrli kuzatuv kamerasi, motorlzoom (2.7-12mm), IR 60m, IP67",
      shortDesc: "2MP AHD oqsilindrli kamera, motorlzoom 2.7-12mm, IR 60m, IP67",
      price: 380000,
      oldPrice: 430000,
      sku: "DAH-HAC-HFW1200RP-Z",
      stock: 15,
      isActive: true,
      isFeatured: false,
      isNew: false,
      images: serializeImages([
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
        "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&q=80",
      ]),
      features: serializeFeatures(["2MP AHD", "Motorlzoom 2.7-12mm", "IR 60m", "IP67", "UTC boshqaruv", "4-videoturkum"]),
      specifications: serializeSpecs([
        { name: "Rezolyutsiya", value: "2MP (1920 × 1080)" },
        { name: "Video turkum", value: "AHD/TVI/CVI/CVBS" },
        { name: "Lins", value: "Motorlzoom 2.7-12mm" },
        { name: "IR masofa", value: "60m" },
        { name: "Himoya", value: "IP67" },
        { name: "Quwatlantirish", value: "12V DC" },
        { name: "Temperatura", value: "-30°C ~ +60°C" },
      ]),
      categoryId: categories[3].id,
      brandId: brands[1].id,
    },
  ];

  for (const productData of productsData) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });
  }
  console.log("✅ Products created:", productsData.length);

  // Create site settings
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      key: "site_config",
      value: JSON.stringify({
        siteName: "SecureCam",
        siteDescription: "O'zbekistonda eng ishonchli aqlli kuzatuv kameralari do'koni. IP, WiFi, 4G, AHD kameralar va NVR yozuvchilar.",
        contactPhone: "+998 71 200 00 00",
        contactEmail: "info@securecam.uz",
        contactAddress: "Toshkent sh., Yunusobod tumani, Amir Temur ko'chasi 107-uy",
        currency: "UZS",
        timezone: "Asia/Tashkent",
        freeDelivery: true,
        minOrderForFreeDelivery: 0,
        telegramEnabled: false,
      }),
      description: "Sayt asosiy sozlamalari",
    },
  });
  console.log("✅ Site settings created");

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });