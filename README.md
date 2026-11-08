# Sổ tay Toán 9 — ôn tập & quiz HK1

Web app ôn tập Toán 9 học kì I theo phong cách "sổ tay toán học sống": giấy ô ly, nét vẽ tay, bút dạ quang; dark mode kiểu bảng đen phấn trắng.

**Stack:** React 18 + Vite 5, Tailwind CSS 4, KaTeX, Framer Motion. Không có backend. Tiến độ lưu trong `localStorage` của trình duyệt.

## Chạy thử

```bash
npm install
npm run dev          # http://localhost:5173
npm run check-data   # kiểm tra file dữ liệu (id trùng, công thức KaTeX lỗi, thiếu lời giải…)
npm run build        # build ra thư mục dist/
```

## Tính năng

| Màn | Đường dẫn | Nội dung |
| --- | --- | --- |
| Bản đồ | `#/` | 5 chương, % đã thuộc mỗi chương, chuỗi ngày học |
| Chương | `#/chuong/1` | Danh sách chủ đề + % thuộc từng chủ đề |
| Thẻ lý thuyết | `#/chu-de/c1t1` | Tóm tắt, công thức nổi bật, ví dụ mở lời giải từng bước |
| Thẻ nhớ | `#/the-nho?c=1&t=c1t1` | Lật thẻ 3D, tự chấm Thuộc / Mơ hồ / Chưa thuộc |
| Luyện tập | `#/luyen-tap?c=1&t=…&d=de` | Chọn chương, chủ đề, độ khó; chấm ngay kèm lời giải |
| Làm full đề | `#/de`, `#/de/c1d1` | 34 đề gốc (ảnh trang đề) với phiếu trả lời, bấm giờ, chấm Phần I–III theo thang mới, lưu bài làm dở |
| Thi thử | `#/thi-thu` | Đề trộn (khoảng 40% dễ, 40% TB, 20% khó), đếm ngược, nộp bài mới chấm |
| Sổ câu sai | `#/so-cau-sai` | Câu làm sai tự vào sổ; làm đúng **2 lần liên tiếp** thì rời sổ |
| Tiến độ | `#/tien-do` | Lịch 28 ngày, % theo chương, lịch sử thi, nút reset |

**% đã thuộc** = (số thẻ đang ở mức "Thuộc" + số câu lần gần nhất làm đúng và không nằm trong sổ sai) / tổng số thẻ và câu.

**Lặp lại ngắt quãng (đơn giản):** mỗi thẻ có mức 0 (chưa thuộc), 1 (mơ hồ), 2 (thuộc), 3 (thuộc vững, tức thuộc 2 lần liền). Thẻ được bốc ngẫu nhiên theo trọng số `mới: 5, 0: 8, 1: 4, 2: 1.5, 3: 0.6`, xem `src/lib/progress.jsx`.

## Cấu trúc thư mục

```
src/
  data/
    chuong-1.json … chuong-5.json   ← TOÀN BỘ nội dung (sửa ở đây)
    index.js                        ← gom các chương, hàm tra cứu
  lib/
    progress.jsx   ← lưu tiến độ, streak, flashcard, sổ câu sai
    quiz.js        ← chấm đáp án, trộn đề, phân tích chủ đề yếu
    storage.js     ← localStorage bọc try/catch
    router.js      ← router dạng #hash (không cần cấu hình server)
  components/      ← MathText (KaTeX), QuestionCard, HighlightBar, Effects (con dấu, confetti)…
  pages/           ← Home, ChapterPage, TopicPage, Flashcards, Practice, Exam, WrongBook, ProgressPage
public/katex/      ← CSS + font KaTeX (copy từ node_modules/katex/dist)
scripts/check-data.mjs
```

## Thêm / sửa nội dung

Mỗi chương là một file `src/data/chuong-N.json`:

```jsonc
{
  "id": 2,
  "title": "Phương trình và bất phương trình bậc nhất một ẩn",
  "short": "PT & BPT một ẩn",          // tên ngắn cho nút lọc
  "doodle": "balance",                // họa tiết: lines | balance | root | triangle | circle
  "status": "ready",                  // "coming" = hiện "sắp có", chưa cho làm quiz
  "topics": [ … ],
  "questions": [ … ]
}
```

### Viết công thức

Mọi chuỗi đều hỗ trợ `$...$` (công thức trong dòng), `$$...$$` (công thức riêng một dòng) và `**đậm**`. Vì là JSON nên dấu `\` phải viết **gấp đôi**:

```json
"Nghiệm: $x = \\dfrac{-b}{a}$ với $a \\neq 0$"
```

Số thập phân trong công thức viết `1{,}5` để KaTeX không chèn khoảng trắng sau dấu phẩy.

### Chủ đề (topic)

```json
{
  "id": "c2t1",
  "title": "Phương trình quy về phương trình bậc nhất một ẩn",
  "aiGenerated": true,
  "summary": "Một câu tóm tắt ngắn.",
  "points": ["Ý 1 có $công\\ thức$", "Ý 2"],
  "formulas": [
    { "id": "c2t1f1", "front": "Mặt trước thẻ", "back": "Mặt sau: $A \\cdot B = 0$" }
  ],
  "example": {
    "problem": "Đề ví dụ",
    "steps": ["Bước 1", "Bước 2"],
    "source": "(tuỳ chọn) nguồn"
  }
}
```

Mỗi phần tử trong `formulas` tự động trở thành một flashcard.

Trường `"mindmap"` là danh sách 3–5 từ khoá ngắn (có thể chứa công thức). Chúng thành các lá của **sơ đồ tư duy** ở trang chương. Trang Bản đồ còn có thêm "Sơ đồ tổng", với nhánh là chương và lá là chủ đề.

### Hình minh hoạ

Mỗi chủ đề có một hình minh hoạ (nhiều hình có thanh kéo hoặc tab để tương tác), viết bằng SVG trong `src/components/illustrations/`. `algebra.jsx` chứa hình của Chương 1–3, `geometry.jsx` chứa hình của Chương 4–5, và `index.js` là bảng tra từ id chủ đề sang hình. Khi thêm chủ đề mới, viết thêm một component rồi khai báo nó trong `index.js`. Chủ đề chưa có hình thì phần minh hoạ tự ẩn.

### Câu hỏi

Các trường chung: `id` (không trùng), `topic` (id chủ đề trong chương), `difficulty` (`de` | `tb` | `kho`), `type`, `prompt`, `answer`, `solution` (mảng các bước), `aiGenerated` (true nếu do AI soạn), `source` (tuỳ chọn).

**Trắc nghiệm 4 đáp án.** `answer` là vị trí đáp án đúng, đếm từ 0. Thứ tự phương án được trộn khi hiển thị.

```json
{ "id": "c2q01", "topic": "c2t1", "difficulty": "de", "type": "mcq",
  "prompt": "Nghiệm của $2x - 4 = 0$ là", "options": ["$x=2$", "$x=-2$", "$x=4$", "$x=\\frac12$"],
  "answer": 0, "solution": ["$2x = 4$", "$x = 2$"], "aiGenerated": false }
```

**Điền đáp số.** `answer` là chuỗi. Khi chấm, `0,5`, `0.5` và `1/2` được coi là bằng nhau. Có thể thêm `accept` để chấp nhận thêm đáp án khác.

```json
{ "id": "c2q02", "topic": "c2t1", "difficulty": "tb", "type": "number",
  "prompt": "Giải $3x + 1 = 7$. Tìm $x$.", "answer": "2", "accept": ["2,0"],
  "solution": ["$3x = 6$", "$x = 2$"] }
```

**Đúng / Sai.** `answer` là `true` hoặc `false`.

```json
{ "id": "c2q03", "topic": "c2t2", "difficulty": "de", "type": "tf",
  "prompt": "Nếu $a > b$ thì $-2a > -2b$.", "answer": false,
  "solution": ["Nhân hai vế với số âm thì đổi chiều bất đẳng thức: $-2a < -2b$."] }
```

Sau khi sửa, chạy `npm run check-data` để bắt lỗi trước khi deploy.

### Bộ đề full (`src/data/bo-de.json`)

Mỗi đề gồm ảnh các trang (lưu trong `public/de-on/img/`, đã cắt bỏ phần đáp án) và bảng đáp án:

```jsonc
{
  "id": "c1d1", "chapter": 1, "num": 1, "pages": [5, 8],
  "imgs": [{ "src": "/de-on/img/c1d1_5.jpg", "w": 1031, "h": 1500 }],
  "key": {
    "mcq": ["B", "B", "C", "..."],          // Phần I: 12 câu A–D
    "tf": [["S","S","S","S"], ["Đ","S","Đ","S"]],  // Phần II: mỗi câu 4 ý Đ/S
    "sa": ["4", "9", "1", "-4"]             // Phần III: đáp số, thập phân dùng dấu phẩy
  }
}
```

`"key": null` nghĩa là đề không có đáp án: vẫn xem được nhưng không chấm. Thang điểm: Phần I 0,25đ/câu; Phần II 0,1 / 0,25 / 0,5 / 1đ cho 1 / 2 / 3 / 4 ý đúng; Phần III 0,5đ/câu (`src/lib/fullExam.js`).

### Mở một chương mới

Điền `topics` và `questions` vào file chương, đổi `"status": "coming"` thành `"ready"`. Chương sẽ tự xuất hiện ở bản đồ, thẻ nhớ, luyện tập và thi thử.

## Deploy lên Vercel

1. Đẩy thư mục này lên một repo GitHub.
2. Trên vercel.com chọn **Add New → Project** rồi import repo. Vercel tự nhận Vite: build command `npm run build`, output `dist` (đã khai báo trong `vercel.json`).
3. Bấm Deploy. App dùng router `#hash` nên không cần cấu hình rewrite.

Hoặc dùng CLI: `npx vercel` (lần đầu), `npx vercel --prod` (bản chính thức).

## Lưu ý về nội dung

Đề cương gốc chủ yếu là bài tập, không có lý thuyết và đáp án. Vì vậy thẻ lý thuyết, flashcard và lời giải đều do AI soạn và được gắn nhãn **✎ AI tạo**. Câu nào phỏng theo đề cương thì có trường `source`. Hãy kiểm tra lại trước khi dùng để dạy hoặc in.
