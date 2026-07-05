import { z } from "zod";

// ─── Login ────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "กรุณากรอกอีเมล")
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน")
    .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Register ─────────────────────────────────────────────────
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "กรุณากรอกอีเมล")
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "รหัสผ่านต้องประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข"
    ),
  confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
  firstNameTh: z.string().min(1, "กรุณากรอกชื่อ (ภาษาไทย)"),
  lastNameTh: z.string().min(1, "กรุณากรอกนามสกุล (ภาษาไทย)"),
  departmentId: z.number().int().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;
