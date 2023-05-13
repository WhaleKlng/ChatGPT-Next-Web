import { NextRequest } from "next/server";
import { getServerApiKey } from "../config/server";

function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

export function auth(req: NextRequest) {
  const authToken = req.headers.get("Authorization") ?? "";
  if (!authToken) {
    return {
      error: true,
      msg: "用户未登陆.",
    };
  }
  // todo 执行用户身份验证

  // 注入系统APIKEY
  const apiKey = getServerApiKey();
  req.headers.set("Authorization", `Bearer ${apiKey}`);

  return {
    error: false,
  };
}
