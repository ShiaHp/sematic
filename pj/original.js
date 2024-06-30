const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const genAI = new GoogleGenerativeAI("AIzaSyCXJG8qgRw7HhQKQJPaD0aUuc5OADj1Yv0");

// In-memory storage for product embeddings
let productStorage = [];

// Function to store the product embedding
async function storeProductEmbedding(product) {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const content = product.description + " " + product.title;
  const result = await model.embedContent(content);
  const embedding = result.embedding.values;
  productStorage.push({ ...product, embedding });
  console.log(`Stored embedding for product: "${product.title}"`);
}

// Function to retrieve the closest product embedding based on a query
async function searchProductEmbedding(query) {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await model.embedContent(query);
  const queryEmbedding = result.embedding.values;

  // console.log(`Searching for closest product to query: "${queryEmbedding}"`);

  fs.writeFileSync(
    "queryEmbedding.json",
    JSON.stringify(queryEmbedding, null, 2)
  );
  let closestProduct = null;
  let closestDistance = Infinity;

  // for (const product of productStorage) {
  //   const distance = cosineDistance(queryEmbedding, product.embedding);
  //   // const dist = model.se
  //   if (distance < closestDistance) {
  //     closestDistance = distance;
  //     closestProduct = product;
  //   }
  // }

  return closestProduct;
}

// Helper function to calculate cosine distance between two vectors
/**
 * ### Description
 * Calculate cosine similarity from 2 arrays.
 *
 * @param {Array} array1 1-dimensional array.
 * @param {Array} array2 1-dimensional array.
 * @return {Number} Calculated result of cosine similarity.
 */
function cosineDistance(vec1, vec2) {
  const dotProduct = vec1.reduce(
    (sum, value, index) => sum + value * vec2[index],
    0
  );
  const magnitude1 = Math.sqrt(
    vec1.reduce((sum, value) => sum + value * value, 0)
  );
  const magnitude2 = Math.sqrt(
    vec2.reduce((sum, value) => sum + value * value, 0)
  );
  return 1 - dotProduct / (magnitude1 * magnitude2);
}

// Example usage
async function run() {
  const products = [
    {
      title: "ssd samsung voi high throughput",
      desc: "SSD Samsung với thông lượng cao, đáp ứng nhanh chóng các yêu cầu về lưu trữ dữ liệu.",
    },
    {
      title: "Màn hình 4K chất lượng cao",
      desc: "Màn hình 4K chất lượng cao với độ phân giải sắc nét và màu sắc sống động.",
    },
    {
      title: "gaming mouse voi customizable buttons",
      desc: "Chuột chơi game với các nút có thể tùy chỉnh, giúp nâng cao trải nghiệm chơi game.",
    },
    {
      title: "mechanical keyboard voi RGB lighting",
      desc: "Bàn phím cơ với đèn nền RGB, mang đến không gian làm việc sáng tạo và phong cách.",
    },
    {
      title: "wireless noise-canceling headphones",
      desc: "Tai nghe không dây chống ồn với chất lượng âm thanh tuyệt vời và thiết kế tiện dụng.",
    },
    {
      title: "portable bluetooth speaker",
      desc: "Loa Bluetooth di động với âm thanh mạnh mẽ và thiết kế chống nước.",
    },
    {
      title: "smartwatch voi heart rate monitor",
      desc: "Đồng hồ thông minh có theo dõi nhịp tim, giúp bạn quản lý sức khỏe hiệu quả hơn.",
    },
    {
      title: "tablet voi stylus support",
      desc: "Máy tính bảng hỗ trợ bút stylus, phù hợp cho công việc sáng tạo và học tập.",
    },
    {
      title: "laptop voi long battery life",
      desc: "Laptop có thời lượng pin lâu, đảm bảo hiệu suất làm việc liên tục trong nhiều giờ.",
    },
    {
      title: "external hard drive voi 1TB capacity",
      desc: "Ổ cứng ngoài dung lượng 1TB, lưu trữ dữ liệu một cách dễ dàng và an toàn.",
    },
    {
      title: "VR headset voi immersive experience",
      desc: "Kính thực tế ảo mang lại trải nghiệm sống động, giúp bạn khám phá thế giới ảo tuyệt vời.",
    },
    {
      title: "fitness tracker voi sleep monitoring",
      desc: "Thiết bị theo dõi sức khỏe với chức năng giám sát giấc ngủ, hỗ trợ bạn duy trì một lối sống lành mạnh.",
    },
    {
      title: "drone voi 4K camera",
      desc: "Máy bay không người lái có camera 4K, giúp bạn quay phim và chụp ảnh chất lượng cao từ không gian.",
    },
    {
      title: "3D printer voi high precision",
      desc: "Máy in 3D với độ chính xác cao, phù hợp cho các ứng dụng sáng tạo và công nghiệp.",
    },
    {
      title: "smartphone voi advanced AI features",
      desc: "Điện thoại thông minh với các tính năng AI tiên tiến và chất lượng camera xuất sắc.",
    },
    {
      title: "e-reader voi adjustable lighting",
      desc: "Máy đọc sách điện tử với ánh sáng có thể điều chỉnh và màn hình sắc nét.",
    },
    {
      title: "electric scooter voi long range",
      desc: "Xe máy điện có phạm vi hoạt động xa và động cơ mạnh mẽ.",
    },
    {
      title: "smart home security camera",
      desc: "Camera an ninh thông minh cho gia đình, giúp bạn giám sát nhà cửa mọi lúc mọi nơi.",
    },
    {
      title: "portable power bank voi fast charging",
      desc: "Pin dự phòng di động với khả năng sạc nhanh và dung lượng cao.",
    },
    {
      title: "wireless charging pad",
      desc: "Chân đế sạc không dây, tiện lợi cho việc sạc pin các thiết bị di động.",
    },
    {
      title: "123123ccaskasldjaksd a.pmg",
      desc: "123123ccaskasldjaksd a.pmg",
    },
  ];

  for (const product of products) {
    await storeProductEmbedding(product);
  }

  const query = "Wireless headphones";
  const result = await searchProductEmbedding(query);
  // console.log(
  //   `Closest match for query: "${query}" is: "${result.title}" with description: "${result.desc}"`
  // );

  fs.writeFileSync(
    "productStorage.json",
    JSON.stringify(productStorage, null, 2)
  );
}

run();
