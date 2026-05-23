import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

// ── Import models ──────────────────────────────────────────────
import User from "./models/User.js";
import Movie from "./models/Movie.js";
import Room from "./models/Room.js";
import Showtime from "./models/Showtime.js";
import Booking from "./models/Booking.js";
import News from "./models/News.js";
import NewsComment from "./models/NewsComment.js";
import Review from "./models/Review.js";

// ── Helpers ────────────────────────────────────────────────────
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const addHours = (date, hours) =>
  new Date(date.getTime() + hours * 60 * 60 * 1000);

// ── Seed function ──────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.DATABASE_URI);
  console.log("✅ Connected to MongoDB:", process.env.DATABASE_URI);

  // ⚠️  Chế độ APPEND – giữ nguyên dữ liệu cũ, chỉ thêm mới
  console.log("➕ Append mode – dữ liệu cũ được giữ nguyên");

  // ── 1. USERS (10 bản) ─────────────────────────────────────────
  const hashedPw = await bcrypt.hash("Password@123", 10);
  const adminHashedPw = await bcrypt.hash("Admin@123456", 10);

  const usersData = [
    {
      email: "admin@cinema.vn",
      username: "admin",
      hashedPassword: adminHashedPw,
      fullname: "Quản Trị Viên",
      role: "Admin",
    },
    {
      email: "nguyenvana@gmail.com",
      username: "nguyenvana",
      hashedPassword: hashedPw,
      fullname: "Nguyễn Văn A",
      role: "User",
    },
    {
      email: "tranthib@gmail.com",
      username: "tranthib",
      hashedPassword: hashedPw,
      fullname: "Trần Thị B",
      role: "User",
    },
    {
      email: "lehongc@gmail.com",
      username: "lehongc",
      hashedPassword: hashedPw,
      fullname: "Lê Hồng C",
      role: "User",
    },
    {
      email: "phamthid@gmail.com",
      username: "phamthid",
      hashedPassword: hashedPw,
      fullname: "Phạm Thị D",
      role: "User",
    },
    {
      email: "hoangvane@gmail.com",
      username: "hoangvane",
      hashedPassword: hashedPw,
      fullname: "Hoàng Văn E",
      role: "User",
    },
    {
      email: "vuminh@gmail.com",
      username: "vuminh",
      hashedPassword: hashedPw,
      fullname: "Vũ Minh Tuấn",
      role: "User",
    },
    {
      email: "dinhthao@gmail.com",
      username: "dinhthao",
      hashedPassword: hashedPw,
      fullname: "Đinh Thị Thảo",
      role: "User",
    },
    {
      email: "buiviet@gmail.com",
      username: "buiviet",
      hashedPassword: hashedPw,
      fullname: "Bùi Việt Dũng",
      role: "User",
    },
    {
      email: "ngothuy@gmail.com",
      username: "ngothuy",
      hashedPassword: hashedPw,
      fullname: "Ngô Thị Thuý",
      role: "User",
    },
  ];

  // ordered: false → bỏ qua bản bị trùng email/username thay vì dừng hẳn
  let users;
  try {
    users = await User.insertMany(usersData, { ordered: false });
  } catch (e) {
    users = e.insertedDocs ?? [];
    if (e.code !== 11000) throw e;
  }
  // Lấy lại toàn bộ users (kể cả bản đã có từ trước)
  users = await User.find({ email: { $in: usersData.map((u) => u.email) } });
  console.log(`👤 Upserted ${users.length} users (bao gồm cũ và mới)`);

  // ── 2. MOVIES (10 bản) ────────────────────────────────────────
  const moviesData = [
    {
      title: "Avengers: Secret Wars",
      description:
        "Các siêu anh hùng Marvel tập hợp để đối mặt với mối đe dọa từ đa vũ trụ trong cuộc chiến khốc liệt nhất từ trước đến nay.",
      duration: 180,
      genres: ["Hành Động", "Phiêu Lưu", "Khoa Học Viễn Tưởng"],
      posterURL: "https://picsum.photos/seed/avengers/400/600",
      releasedDate: new Date("2025-05-01"),
      actors: [
        "Robert Downey Jr.",
        "Chris Evans",
        "Scarlett Johansson",
        "Benedict Cumberbatch",
      ],
      status: "Now Showing",
      avgRating: 0,
      reviewCount: 0,
    },
    {
      title: "Lật Mặt 7: Một Điều Ước",
      description:
        "Câu chuyện cảm động về tình thân và những bí mật gia đình được hé lộ qua từng thước phim đầy xúc cảm.",
      duration: 128,
      genres: ["Tâm Lý", "Gia Đình", "Drama"],
      posterURL: "https://picsum.photos/seed/latmat7/400/600",
      releasedDate: new Date("2025-04-15"),
      actors: ["Lý Hải", "Minh Hà", "Tuấn Trần", "Gia Linh"],
      status: "Now Showing",
      avgRating: 0,
      reviewCount: 0,
    },
    {
      title: "Inception 2",
      description:
        "Dom Cobb trở lại với sứ mệnh mới: xâm nhập vào tầng sâu nhất của vô thức – nơi không ai từng đặt chân đến và còn sống sót.",
      duration: 155,
      genres: ["Khoa Học Viễn Tưởng", "Hành Động", "Hồi Hộp"],
      posterURL: "https://picsum.photos/seed/inception2/400/600",
      releasedDate: new Date("2025-06-20"),
      actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
      status: "Coming Soon",
      avgRating: 0,
      reviewCount: 0,
    },
    {
      title: "Kẻ Trộm Ánh Trăng",
      description:
        "Một tên trộm tài ba vô tình lấy đi bí mật quốc gia, trở thành mục tiêu truy đuổi của cả băng đảng lẫn chính quyền.",
      duration: 112,
      genres: ["Tội Phạm", "Hài", "Hành Động"],
      posterURL: "https://picsum.photos/seed/ketrom/400/600",
      releasedDate: new Date("2025-03-10"),
      actors: ["Trấn Thành", "Anh Tú", "Kaity Nguyễn"],
      status: "Now Showing",
      avgRating: 0,
      reviewCount: 0,
    },
    {
      title: "Dune: Part Three",
      description:
        "Paul Atreides tiếp tục cuộc chiến giành quyền kiểm soát hành tinh Arrakis – nguồn tài nguyên duy nhất của vũ trụ.",
      duration: 170,
      genres: ["Khoa Học Viễn Tưởng", "Phiêu Lưu", "Drama"],
      posterURL: "https://picsum.photos/seed/dune3/400/600",
      releasedDate: new Date("2025-11-01"),
      actors: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
      status: "Coming Soon",
      avgRating: 0,
      reviewCount: 0,
    },
    {
      title: "Quỷ Cẩu",
      description:
        "Truyền thuyết về con quỷ chó ma ám ảnh ngôi làng nhỏ miền núi, nơi một nhóm bạn trẻ phải đối mặt với nỗi kinh hoàng.",
      duration: 105,
      genres: ["Kinh Dị", "Bí Ẩn"],
      posterURL: "https://picsum.photos/seed/quycau/400/600",
      releasedDate: new Date("2025-04-30"),
      actors: ["Võ Điền Gia Huy", "Lê Bống", "Nam Thư"],
      status: "Now Showing",
      avgRating: 0,
      reviewCount: 0,
    },
    {
      title: "Spider-Man: Beyond the Spider-Verse",
      description:
        "Miles Morales đối mặt với số phận khi phát hiện mọi Spider-Man đều phải mất đi điều quý giá nhất.",
      duration: 140,
      genres: ["Hoạt Hình", "Hành Động", "Phiêu Lưu"],
      posterURL: "https://picsum.photos/seed/spiderman/400/600",
      releasedDate: new Date("2025-07-04"),
      actors: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
      status: "Coming Soon",
      avgRating: 0,
      reviewCount: 0,
    },
    {
      title: "Mắt Biếc",
      description:
        "Chuyện tình buồn của Ngạn và Hà Lan qua những tháng năm tuổi thơ, lớn lên với những lựa chọn làm thay đổi cuộc đời.",
      duration: 118,
      genres: ["Tâm Lý", "Lãng Mạn", "Drama"],
      posterURL: "https://picsum.photos/seed/matbiec/400/600",
      releasedDate: new Date("2025-02-14"),
      actors: ["Trần Nghĩa", "Lan Ngọc", "Trịnh Thăng Bình"],
      status: "Now Showing",
      avgRating: 0,
      reviewCount: 0,
    },
    {
      title: "Fast X: Part 2",
      description:
        "Gia đình Dom Toretto tiếp tục cuộc chiến chống lại kẻ thù nguy hiểm nhất từ trước đến nay – con trai của Hernan Reyes.",
      duration: 145,
      genres: ["Hành Động", "Phiêu Lưu"],
      posterURL: "https://picsum.photos/seed/fastx2/400/600",
      releasedDate: new Date("2025-08-22"),
      actors: ["Vin Diesel", "Jason Momoa", "Michelle Rodriguez"],
      status: "Coming Soon",
      avgRating: 0,
      reviewCount: 0,
    },
    {
      title: "Nhà Không Bán",
      description:
        "Một gia đình quyết tâm giữ lại ngôi nhà di sản trước áp lực của các tập đoàn bất động sản, hé lộ những bí mật thế hệ.",
      duration: 122,
      genres: ["Drama", "Gia Đình"],
      posterURL: "https://picsum.photos/seed/nhakhongban/400/600",
      releasedDate: new Date("2025-05-10"),
      actors: ["Hồng Vân", "Đại Nghĩa", "Diễm My 9X"],
      status: "Now Showing",
      avgRating: 0,
      reviewCount: 0,
    },
  ];

  const movies = await Movie.insertMany(moviesData);
  console.log(`🎬 Inserted ${movies.length} movies`);

  // ── 3. ROOMS (10 bản) ─────────────────────────────────────────
  const buildSeats = (rows, cols, vipRows = [], sweetboxRows = []) => {
    const seats = [];
    for (const row of rows) {
      for (let n = 1; n <= cols; n++) {
        let type = "Standard";
        if (sweetboxRows.includes(row)) type = "Sweetbox";
        else if (vipRows.includes(row)) type = "VIP";
        seats.push({ row, number: n, type });
      }
    }
    return seats;
  };

  const roomsData = [
    {
      name: "Phòng 1 – IMAX",
      seatLayouts: buildSeats(
        ["A", "B", "C", "D", "E", "F", "G", "H"],
        12,
        ["E", "F", "G"],
        ["H"]
      ),
    },
    {
      name: "Phòng 2 – 4DX",
      seatLayouts: buildSeats(
        ["A", "B", "C", "D", "E", "F"],
        10,
        ["D", "E"],
        ["F"]
      ),
    },
    {
      name: "Phòng 3 – Premium",
      seatLayouts: buildSeats(
        ["A", "B", "C", "D", "E", "F", "G"],
        10,
        ["E", "F"],
        ["G"]
      ),
    },
    {
      name: "Phòng 4 – Standard",
      seatLayouts: buildSeats(
        ["A", "B", "C", "D", "E", "F", "G", "H"],
        10,
        ["F", "G"],
        []
      ),
    },
    {
      name: "Phòng 5 – Couples",
      seatLayouts: buildSeats(
        ["A", "B", "C", "D", "E"],
        8,
        ["C", "D"],
        ["E"]
      ),
    },
    {
      name: "Phòng 6 – Mini",
      seatLayouts: buildSeats(["A", "B", "C", "D"], 8, ["C"], ["D"]),
    },
    {
      name: "Phòng 7 – Deluxe",
      seatLayouts: buildSeats(
        ["A", "B", "C", "D", "E", "F", "G"],
        12,
        ["E", "F"],
        ["G"]
      ),
    },
    {
      name: "Phòng 8 – Gold Class",
      seatLayouts: buildSeats(
        ["A", "B", "C", "D", "E", "F"],
        10,
        ["D", "E"],
        ["F"]
      ),
    },
    {
      name: "Phòng 9 – Screenx",
      seatLayouts: buildSeats(
        ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
        12,
        ["G", "H"],
        ["I"]
      ),
    },
    {
      name: "Phòng 10 – VIP Lounge",
      seatLayouts: buildSeats(
        ["A", "B", "C", "D", "E"],
        6,
        ["A", "B", "C"],
        ["D", "E"]
      ),
    },
  ];

  const rooms = await Room.insertMany(roomsData);
  console.log(`🏠 Inserted ${rooms.length} rooms`);

  // ── 4. SHOWTIMES (10 bản) ─────────────────────────────────────
  const now = new Date();
  const showingMovies = movies.filter((m) => m.status === "Now Showing");

  const showtimesData = [];
  for (let i = 0; i < 10; i++) {
    const movie = showingMovies[i % showingMovies.length];
    const room = rooms[i % rooms.length];
    const startTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + Math.floor(i / 2),
      9 + (i % 5) * 3,
      0,
      0
    );
    const endTime = addHours(startTime, movie.duration / 60 + 0.25);
    showtimesData.push({
      movieID: movie._id,
      roomID: room._id,
      bookedSeat: [],
      startTime,
      endTime,
      ticketPrices: {
        standard: randomItem([75000, 80000, 85000, 90000]),
        vip: randomItem([100000, 110000, 120000]),
        sweetbox: randomItem([140000, 150000, 160000]),
      },
    });
  }

  const showtimes = await Showtime.insertMany(showtimesData);
  console.log(`🎟️  Inserted ${showtimes.length} showtimes`);

  // ── 5. BOOKINGS (10 bản) ──────────────────────────────────────
  const regularUsers = users.filter((u) => u.role === "User");
  const bookingStatuses = [
    "Pending",
    "Confirmed",
    "Confirmed",
    "Confirmed",
    "Cancelled",
  ];
  const paymentMethods = ["VNPay", "Momo", "ZaloPay", "Cash"];

  const bookingsData = [];
  for (let i = 0; i < 10; i++) {
    const user = regularUsers[i % regularUsers.length];
    const showtime = showtimes[i % showtimes.length];
    const room = rooms.find((r) => r._id.equals(showtime.roomID));
    const availableSeats = room.seatLayouts.slice(i * 2, i * 2 + 2);

    const seats = availableSeats.map((s) => ({
      row: s.row,
      number: s.number,
      seatType: s.type,
    }));

    const totalAmount = seats.reduce((sum, seat) => {
      if (seat.seatType === "Standard")
        return sum + showtime.ticketPrices.standard;
      if (seat.seatType === "VIP") return sum + showtime.ticketPrices.vip;
      if (seat.seatType === "Sweetbox")
        return sum + showtime.ticketPrices.sweetbox;
      return sum;
    }, 0);

    const status = randomItem(bookingStatuses);
    const paymentStatus =
      status === "Confirmed"
        ? "Completed"
        : status === "Cancelled"
        ? "Failed"
        : "Pending";

    bookingsData.push({
      userID: user._id,
      showtimeID: showtime._id,
      seats,
      totalAmount,
      status,
      payment: {
        transactionId: `TXN${Date.now()}${i}`,
        status: paymentStatus,
        method: randomItem(paymentMethods),
        amount: totalAmount,
        bankCode: "NCB",
        paidAt: paymentStatus === "Completed" ? new Date() : undefined,
      },
    });
  }

  const bookings = await Booking.insertMany(bookingsData);
  console.log(`📋 Inserted ${bookings.length} bookings`);

  // ── 6. NEWS (10 bản) ──────────────────────────────────────────
  const admin = users.find((u) => u.role === "Admin");

  const newsData = [
    {
      title: "Avengers: Secret Wars – Bom tấn định hình lại MCU ra mắt tháng 5",
      content:
        "Bộ phim được mong đợi nhất năm 2025 – Avengers: Secret Wars – chính thức khởi chiếu từ ngày 1/5/2025 tại hệ thống rạp CGV, BHD Star và Lotte Cinema toàn quốc.\n\nVới kinh phí sản xuất lên tới 500 triệu USD, đây hứa hẹn sẽ là bộ phim siêu anh hùng hoành tráng nhất từ trước đến nay. Đặt vé ngay hôm nay để nhận ưu đãi ghế VIP miễn phí!",
      thumbnailURL: "https://picsum.photos/seed/news1/800/400",
      category: "Phim mới",
      authorId: admin._id,
      commentCount: 0,
    },
    {
      title: "Khuyến mãi thứ 4 hàng tuần – Mua 1 tặng 1 cho tất cả suất chiếu",
      content:
        "Mỗi thứ 4 hàng tuần, CinemaVN áp dụng chương trình Mua 1 Tặng 1 cho tất cả các loại ghế. Chương trình áp dụng từ 8h00 đến 22h00, không giới hạn số lượng giao dịch mỗi tài khoản.\n\nÁp dụng cho thành viên đã đăng ký tài khoản và thanh toán qua ứng dụng.",
      thumbnailURL: "https://picsum.photos/seed/news2/800/400",
      category: "Khuyến mãi",
      authorId: admin._id,
      commentCount: 0,
    },
    {
      title: "Ra mắt phòng chiếu IMAX mới – Trải nghiệm điện ảnh đỉnh cao",
      content:
        "CinemaVN tự hào khai trương phòng chiếu IMAX thế hệ mới tại Hà Nội và TP.HCM. Màn hình rộng 26m, âm thanh 12 kênh Dolby Atmos và hệ thống ghế massage cao cấp đem lại trải nghiệm điện ảnh chưa từng có.\n\nMua vé IMAX ngay hôm nay để trải nghiệm sự khác biệt!",
      thumbnailURL: "https://picsum.photos/seed/news3/800/400",
      category: "Thông báo",
      authorId: admin._id,
      commentCount: 0,
    },
    {
      title: "Lật Mặt 7 vượt mốc 300 tỷ sau 3 tuần công chiếu",
      content:
        "Siêu phẩm điện ảnh Việt Nam Lật Mặt 7: Một Điều Ước của đạo diễn Lý Hải đã chính thức vượt mốc doanh thu 300 tỷ đồng chỉ sau 3 tuần ra rạp, thiết lập kỷ lục mới cho phim Việt.\n\nBộ phim tiếp tục được chiếu tại tất cả các rạp trên toàn quốc cho đến hết tháng 5.",
      thumbnailURL: "https://picsum.photos/seed/news4/800/400",
      category: "Phim mới",
      authorId: admin._id,
      commentCount: 0,
    },
    {
      title: "Sự kiện Fan Meeting: Gặp gỡ dàn diễn viên Quỷ Cẩu tại Hà Nội",
      content:
        "Đừng bỏ lỡ sự kiện Fan Meeting đặc biệt với dàn diễn viên của bộ phim kinh dị hot nhất mùa hè – Quỷ Cẩu. Sự kiện diễn ra vào ngày 15/5/2025 tại Trung tâm thương mại Aeon Mall Long Biên.\n\nKhán giả mua vé xem phim sẽ được nhận vé tham dự sự kiện miễn phí.",
      thumbnailURL: "https://picsum.photos/seed/news5/800/400",
      category: "Sự kiện",
      authorId: admin._id,
      commentCount: 0,
    },
    {
      title: "Ưu đãi sinh nhật – Giảm 50% cho thành viên vào tháng sinh nhật",
      content:
        "Nhân kỷ niệm 10 năm thành lập, CinemaVN dành tặng ưu đãi giảm 50% giá vé cho tất cả thành viên trong tháng sinh nhật của mình.\n\nChương trình áp dụng từ 1/5 đến 31/12/2025. Cập nhật thông tin sinh nhật trong hồ sơ cá nhân để nhận ưu đãi.",
      thumbnailURL: "https://picsum.photos/seed/news6/800/400",
      category: "Khuyến mãi",
      authorId: admin._id,
      commentCount: 0,
    },
    {
      title: "Dune: Part Three chính thức xác nhận ngày khởi chiếu tháng 11",
      content:
        "Warner Bros. và Legendary Pictures vừa chính thức xác nhận Dune: Part Three sẽ ra mắt toàn cầu vào ngày 1/11/2025. Bộ phim sẽ kết thúc bộ ba của đạo diễn Denis Villeneuve dựa trên tiểu thuyết của Frank Herbert.\n\nĐặt vé sớm ngay hôm nay để nhận ghế VIP miễn phí.",
      thumbnailURL: "https://picsum.photos/seed/news7/800/400",
      category: "Phim mới",
      authorId: admin._id,
      commentCount: 0,
    },
    {
      title: "Thông báo: Nâng cấp hệ thống thanh toán từ ngày 20/5/2025",
      content:
        "CinemaVN thông báo nâng cấp toàn bộ hệ thống thanh toán từ ngày 20/5/2025. Trong thời gian bảo trì (22h00 – 02h00), một số tính năng thanh toán online có thể bị gián đoạn.\n\nChúng tôi xin lỗi vì sự bất tiện này và cam kết mang lại trải nghiệm tốt hơn sau khi nâng cấp.",
      thumbnailURL: "https://picsum.photos/seed/news8/800/400",
      category: "Thông báo",
      authorId: admin._id,
      commentCount: 0,
    },
    {
      title: "Festival Phim Hoạt Hình Quốc Tế 2025 tại CinemaVN",
      content:
        "CinemaVN tự hào là đơn vị đồng tổ chức Liên hoan phim Hoạt hình Quốc tế 2025. Sự kiện diễn ra từ ngày 1-10/6 với hơn 30 tác phẩm từ 15 quốc gia, bao gồm buổi chiếu đặc biệt Spider-Man: Beyond the Spider-Verse.\n\nVé ưu đãi dành cho học sinh, sinh viên với mức giá chỉ 50.000đ.",
      thumbnailURL: "https://picsum.photos/seed/news9/800/400",
      category: "Sự kiện",
      authorId: admin._id,
      commentCount: 0,
    },
    {
      title: "Combo Popcorn + Nước Giảm 30% Khi Đặt Vé Online",
      content:
        "Từ ngày 1/5 đến 31/5/2025, khi đặt vé xem phim online tại CinemaVN, bạn sẽ nhận ngay mã giảm giá 30% cho combo Popcorn Lớn + 2 Nước ngọt tại quầy.\n\nMã khuyến mãi sẽ được gửi tự động vào email sau khi thanh toán thành công. Không áp dụng cho vé đoàn từ 10 người trở lên.",
      thumbnailURL: "https://picsum.photos/seed/news10/800/400",
      category: "Khuyến mãi",
      authorId: admin._id,
      commentCount: 0,
    },
  ];

  const newsItems = await News.insertMany(newsData);
  console.log(`📰 Inserted ${newsItems.length} news`);

  // ── 7. NEWS COMMENTS (10 bản) ─────────────────────────────────
  const sampleComments = [
    "Bộ phim này hay lắm, mình đã xem 3 lần rồi!",
    "Cảm ơn thông tin, sẽ mua vé ngay!",
    "Ưu đãi quá tuyệt vời, mình sẽ rủ cả nhóm đi xem.",
    "Không biết phim có phụ đề tiếng Việt không nhỉ?",
    "Mình rất mong chờ bộ phim này, trailer trông cực đỉnh!",
    "Chương trình khuyến mãi này áp dụng cho tất cả rạp không vậy admin?",
    "Đã mua vé rồi, rất háo hức được xem phim!",
    "Phim Việt Nam ngày càng chất lượng hơn, tự hào lắm!",
    "Ghế IMAX ngồi có thoải mái không các bạn ơi?",
    "Fan meeting mà không ở TP.HCM thì buồn quá.",
  ];

  const newsCommentsData = regularUsers.map((user, i) => ({
    newsId: newsItems[i % newsItems.length]._id,
    userId: user._id,
    content: sampleComments[i],
  }));

  const newsComments = await NewsComment.insertMany(newsCommentsData);
  console.log(`💬 Inserted ${newsComments.length} news comments`);

  // ── 8. REVIEWS (10 bản) ───────────────────────────────────────
  const nowShowingMovies = movies.filter((m) => m.status === "Now Showing");
  const reviewComments = [
    "Phim quá hay, diễn xuất tuyệt vời, hiệu ứng hình ảnh đỉnh cao!",
    "Cốt truyện hơi nhàm ở giữa nhưng phần cuối rất bùng cháy.",
    "Mình đã khóc từ đầu đến cuối, cảm xúc thật sự.",
    "Xứng đáng 5 sao, sẽ xem lại lần 2 tuần sau.",
    "Âm thanh Dolby Atmos cùng hình ảnh sắc nét làm tôi ngợp thở.",
    "Phim hay nhưng hơi dài, cần cắt bớt một số cảnh không cần thiết.",
    "Diễn viên chính diễn xuất chân thật, rất cảm xúc!",
    "Đồ họa CGI đẹp mắt, xứng đáng xem trên màn hình IMAX.",
    "Kịch bản chặt chẽ, không đoán được cái kết, rất thú vị!",
    "Nhạc phim hay, mình đã tải về nghe lại nhiều lần.",
  ];

  // Mỗi user review 1 movie khác nhau (tránh duplicate key)
  const reviewsData = regularUsers.map((user, i) => ({
    movieId: nowShowingMovies[i % nowShowingMovies.length]._id,
    userId: user._id,
    rating: randomInt(3, 5),
    comment: reviewComments[i],
  }));

  // ordered: false → bỏ qua cặp movieId+userId đã tồn tại
  let reviews;
  try {
    reviews = await Review.insertMany(reviewsData, { ordered: false });
  } catch (e) {
    reviews = e.insertedDocs ?? [];
    if (e.code !== 11000) throw e;
  }
  console.log(`⭐ Inserted ${reviews.length} reviews (bỏ qua duplicate)`);

  // Tính lại avgRating & reviewCount từ toàn bộ Review trong DB (không ghi đè bằng số cũ)
  if (reviews.length > 0) {
    const affectedMovieIds = [...new Set(reviews.map((r) => r.movieId.toString()))];
    for (const movieId of affectedMovieIds) {
      const allReviews = await Review.find({ movieId });
      const avg =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Movie.findByIdAndUpdate(movieId, {
        avgRating: Math.round(avg * 10) / 10,
        reviewCount: allReviews.length,
      });
    }
  }
  console.log("⭐ Updated avgRating & reviewCount for movies");

  // Tính lại commentCount từ toàn bộ NewsComment trong DB
  if (newsComments.length > 0) {
    const affectedNewsIds = [...new Set(newsComments.map((c) => c.newsId.toString()))];
    for (const newsId of affectedNewsIds) {
      const total = await NewsComment.countDocuments({ newsId });
      await News.findByIdAndUpdate(newsId, { commentCount: total });
    }
  }
  console.log("💬 Updated commentCount for news");

  console.log("\n✅ ===== SEED HOÀN TẤT =====");
  console.log(`   👤 Users      : ${users.length}`);
  console.log(`   🎬 Movies     : ${movies.length}`);
  console.log(`   🏠 Rooms      : ${rooms.length}`);
  console.log(`   🎟️  Showtimes  : ${showtimes.length}`);
  console.log(`   📋 Bookings   : ${bookings.length}`);
  console.log(`   📰 News       : ${newsItems.length}`);
  console.log(`   💬 Comments   : ${newsComments.length}`);
  console.log(`   ⭐ Reviews    : ${reviews.length}`);
  console.log("\n📧 Admin : admin@cinema.vn  /  Admin@123456");
  console.log("📧 User  : nguyenvana@gmail.com  /  Password@123");

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected from MongoDB");
}

seed().catch((err) => {
  console.error("❌ Seed thất bại:", err);
  mongoose.disconnect();
  process.exit(1);
});
