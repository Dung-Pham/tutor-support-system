# Admin Panel - Tutor Support System

Admin dashboard để quản lý hệ thống Tutor Support.

## 🚀 Tính năng

- **Dashboard**: Thống kê tổng quan hệ thống
- **Quản lý Users**: Xem, tìm kiếm, khóa/mở khóa tài khoản
- **Quản lý Bài viết**: Duyệt, từ chối bài viết

## 📦 Cài đặt

```bash
# Di chuyển vào thư mục admin
cd admin

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

## 🛠️ Tech Stack

- **React 18** + TypeScript
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Shadcn/UI** - UI Components
- **Zustand** - State management
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Hook Form** + Zod - Form validation

## 📁 Cấu trúc thư mục

```
admin/
├── src/
│   ├── components/
│   │   ├── layout/      # Layout components (Sidebar, Header)
│   │   └── ui/          # Shadcn UI components
│   ├── pages/
│   │   ├── auth/        # Login page
│   │   ├── users/       # User management
│   │   └── posts/       # Post moderation
│   ├── services/        # API services
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript types
│   ├── lib/             # Utilities
│   └── routes/          # React Router config
├── public/
└── package.json
```

## 🔧 Environment Variables

Tạo file `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📝 Scripts

- `npm run dev` - Chạy development server (port 3002)
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## 🔐 Authentication

Admin panel yêu cầu đăng nhập với tài khoản có role `admin`.
Token được lưu trong localStorage và tự động gửi kèm mỗi request.
