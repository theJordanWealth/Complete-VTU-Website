import { success } from "@/lib/api-response";

export async function POST() {
  const response = success({ message: "Logged out" });
  response.cookies.delete("token");
  return response;
}
