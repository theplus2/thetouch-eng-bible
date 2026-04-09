import { redirect } from "next/navigation";

export default function Home() {
  // 랜딩 페이지 → /home으로 리다이렉트
  redirect("/home");
}
