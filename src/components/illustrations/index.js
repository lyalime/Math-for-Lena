// Bảng tra: id chủ đề → hình minh hoạ hiển thị trên thẻ lý thuyết.
// Muốn thêm minh hoạ cho chủ đề mới: viết component trong algebra.jsx / geometry.jsx rồi khai báo ở đây.
import { C1T1, C1T2, C1T3, C2T1, C2T2, C2T3, C3T1, C3T2, C3T3, C3T4, C3T5 } from './algebra'
import { C4T1, C4T2, C4T3, C5T1, C5T2, C5T3, C5T4, C5T5 } from './geometry'

export const illustrations = {
  c1t1: C1T1,
  c1t2: C1T2,
  c1t3: C1T3,
  c2t1: C2T1,
  c2t2: C2T2,
  c2t3: C2T3,
  c3t1: C3T1,
  c3t2: C3T2,
  c3t3: C3T3,
  c3t4: C3T4,
  c3t5: C3T5,
  c4t1: C4T1,
  c4t2: C4T2,
  c4t3: C4T3,
  c5t1: C5T1,
  c5t2: C5T2,
  c5t3: C5T3,
  c5t4: C5T4,
  c5t5: C5T5,
}
