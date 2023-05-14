import { NextRequest } from "next/server";
import axios from "axios";

const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

/**
 * 传入 method / url / data 即可
 * {
 *     url: '/user/login',
 *     method: 'post',
 *     data: {}
 * }
 * @param config
 */
export async function requestServer(config: any) {
  let data = JSON.stringify(config.data || {});
  let method = config.method || "POST";
  let url = config.url;

  let req_config = {
    method: method,
    url: "/server" + url,
    headers: { "Content-Type": "application/json" },
    data: data,
  };

  try {
    const res_data = (await axios.request(req_config)).data;
    console.log(res_data);
    return res_data;
  } catch (e) {
    console.log(e);
    return {};
  }
}

export async function requestOpenai(req: NextRequest) {
  const authValue = req.headers.get("Authorization") ?? "";
  const openaiPath = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
    "/api/openai/",
    "",
  );

  let baseUrl = BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `${PROTOCOL}://${baseUrl}`;
  }

  console.log("[Proxy] ", openaiPath);
  console.log("[Base Url]", baseUrl);

  if (process.env.OPENAI_ORG_ID) {
    console.log("[Org ID]", process.env.OPENAI_ORG_ID);
  }

  if (!authValue || !authValue.startsWith("Bearer sk-")) {
    console.error("[OpenAI Request] invalid api key provided", authValue);
  }

  return fetch(`${baseUrl}/${openaiPath}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: authValue,
      ...(process.env.OPENAI_ORG_ID && {
        "OpenAI-Organization": process.env.OPENAI_ORG_ID,
      }),
    },
    cache: "no-store",
    method: req.method,
    body: req.body,
  });
}
