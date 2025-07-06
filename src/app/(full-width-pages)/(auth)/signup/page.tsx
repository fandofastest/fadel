import SignUpWrapper from "./SignUpWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Akun | Malay Futsal",
  description: "Buat akun baru untuk memesan lapangan futsal",
};

export default function SignUp() {
  return <SignUpWrapper />;
}
