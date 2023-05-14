import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKey } from "../constant";
import { BOT_HELLO } from "./chat";
import { ALL_MODELS } from "./config";
import { requestServer } from "@/app/api/common";

const axios = require("axios");

export interface AccessControlStore {
  //  用户token
  token: string;
  //用户ApiKey
  userApiKey: string;
  hideUserApiKey: boolean;
  openaiUrl: string;

  updateToken: (_: string) => void;
  updateUserApiKey: (_: string) => void;
  isAuthorized: () => boolean;
  login: (userName: string, passWord: string) => any;
  fetch: () => void;
}

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

export const useAccessStore = create<AccessControlStore>()(
  persist(
    (set, get) => {
      return {
        token: "",
        userApiKey: "", //在这里填入API KEY可以访问
        hideUserApiKey: true,
        openaiUrl: "/api/openai/",

        async login(userName: string, passWord: string) {
          console.log("用户登录");

          return await requestServer({
            url: "/user/login",
            data: {
              phoneNumber: userName,
              password: passWord,
            },
          });
        },

        updateToken(token: string) {
          set(() => ({ token }));
        },
        updateUserApiKey(apiKey: string) {
          set(() => ({ userApiKey: apiKey }));
        },
        isAuthorized() {
          get().fetch();

          return !!get().userApiKey || !!get().token;
        },
        fetch() {
          if (fetchState > 0) return;
          fetchState = 1;
          fetch("/api/config", {
            method: "post",
            body: null,
          })
            .then((res) => res.json())
            .then((res: DangerConfig) => {
              console.log("[Config] got config from server", res);
              set(() => ({ ...res }));

              if (!res.enableGPT4) {
                ALL_MODELS.forEach((model) => {
                  if (model.name.startsWith("gpt-4")) {
                    (model as any).available = false;
                  }
                });
              }

              if ((res as any).botHello) {
                BOT_HELLO.content = (res as any).botHello;
              }
            })
            .catch(() => {
              console.error("[Config] failed to fetch config");
            })
            .finally(() => {
              fetchState = 2;
            });
        },
      };
    },
    {
      name: StoreKey.Access,
      version: 1,
    },
  ),
);
