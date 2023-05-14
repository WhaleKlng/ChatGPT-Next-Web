import { useEffect, useRef, useState } from "react";
import { Path, SlotID } from "../constant";
import { IconButton } from "./button";
import { EmojiAvatar } from "./emoji";
import styles from "./login.module.scss";

import LeftIcon from "../icons/left.svg";
import LightningIcon from "../icons/lightning.svg";
import EyeIcon from "../icons/eye.svg";
import EyeOffIcon from "../icons/eye-off.svg";

import { useLocation, useNavigate } from "react-router-dom";
import { Mask, useMaskStore } from "../store/mask";
import Locale from "../locales";
import { useAccessStore, useAppConfig, useChatStore } from "../store";
import { MaskAvatar } from "./mask";
import { useCommand } from "../command";
import { Toast } from "@/app/components/ui-lib";
import tr from "@/app/locales/tr";

function getIntersectionArea(aRect: DOMRect, bRect: DOMRect) {
  const xmin = Math.max(aRect.x, bRect.x);
  const xmax = Math.min(aRect.x + aRect.width, bRect.x + bRect.width);
  const ymin = Math.max(aRect.y, bRect.y);
  const ymax = Math.min(aRect.y + aRect.height, bRect.y + bRect.height);
  const width = xmax - xmin;
  const height = ymax - ymin;
  const intersectionArea = width < 0 || height < 0 ? 0 : width * height;
  return intersectionArea;
}

function MaskItem(props: { mask: Mask; onClick?: () => void }) {
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const changeOpacity = () => {
      const dom = domRef.current;
      const parent = document.getElementById(SlotID.AppBody);
      if (!parent || !dom) return;

      const domRect = dom.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      const intersectionArea = getIntersectionArea(domRect, parentRect);
      const domArea = domRect.width * domRect.height;
      const ratio = intersectionArea / domArea;
      const opacity = ratio > 0.9 ? 1 : 0.4;
      dom.style.opacity = opacity.toString();
    };

    setTimeout(changeOpacity, 30);

    window.addEventListener("resize", changeOpacity);

    return () => window.removeEventListener("resize", changeOpacity);
  }, [domRef]);

  return (
    <div className={styles["mask"]} ref={domRef} onClick={props.onClick}>
      <MaskAvatar mask={props.mask} />
      <div className={styles["mask-name"] + " one-line"}>{props.mask.name}</div>
    </div>
  );
}

function useMaskGroup(masks: Mask[]) {
  const [groups, setGroups] = useState<Mask[][]>([]);

  useEffect(() => {
    const appBody = document.getElementById(SlotID.AppBody);
    if (!appBody || masks.length === 0) return;

    const rect = appBody.getBoundingClientRect();
    const maxWidth = rect.width;
    const maxHeight = rect.height * 0.6;
    const maskItemWidth = 120;
    const maskItemHeight = 50;

    const randomMask = () => masks[Math.floor(Math.random() * masks.length)];
    let maskIndex = 0;
    const nextMask = () => masks[maskIndex++ % masks.length];

    const rows = Math.ceil(maxHeight / maskItemHeight);
    const cols = Math.ceil(maxWidth / maskItemWidth);

    const newGroups = new Array(rows)
      .fill(0)
      .map((_, _i) =>
        new Array(cols)
          .fill(0)
          .map((_, j) => (j < 1 || j > cols - 2 ? randomMask() : nextMask())),
      );

    setGroups(newGroups);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return groups;
}

export function Login() {
  const chatStore = useChatStore();
  const maskStore = useMaskStore();

  const masks = maskStore.getAll();
  const groups = useMaskGroup(masks);

  const navigate = useNavigate();
  const config = useAppConfig();

  const { state } = useLocation();

  //   let showPassword = true;
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const startChat = (mask?: Mask) => {
    chatStore.newSession(mask);
    setTimeout(() => navigate(Path.Chat), 1);
  };

  useCommand({
    mask: (id) => {
      try {
        const mask = maskStore.get(parseInt(id));
        startChat(mask ?? undefined);
      } catch {
        console.error("[New Chat] failed to create chat from mask id=", id);
      }
    },
  });

  function EyeButton(props: any) {
    const showPwd = props.showPassword;
    if (showPwd) {
      return (
        <EyeIcon
          onClick={() => {
            setShowPassword(false);
          }}
          className={styles["eye"]}
        />
      );
    }
    return (
      <EyeOffIcon
        onClick={() => {
          setShowPassword(true);
        }}
        className={styles["eye"]}
      />
    );
  }

  const [token, updateToken, login] = useAccessStore((state) => [
    state.token,
    state.updateToken,
    state.login,
  ]);
  const [loginFail, setLoginFail] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  return token != "" ? (
    <div className={styles["new-chat"]}>
      <div className={styles["title"]}>{Locale.Logined.Title}</div>
      <div className={styles["sub-title"]}>{Locale.Logined.SubTitle}</div>
      <div className={styles["actions"]}>
        <IconButton
          className={styles["register-btn"]}
          text={Locale.Logined.Logout}
          bordered
          onClick={() => updateToken("")}
          shadow
        />
        <IconButton
          className={styles["register-btn"]}
          text={Locale.Logined.BackHome}
          bordered
          type="primary"
          onClick={() => navigate(Path.Home)}
          shadow
        />
      </div>
    </div>
  ) : (
    <div className={styles["new-chat"]}>
      <div className={styles["title"]}>
        {isRegister ? Locale.Login.RegisterTitle : Locale.Login.Title}
      </div>
      <div className={styles["sub-title"]}>
        {isRegister ? Locale.Login.RegisterSubTitle : Locale.Login.SubTitle}
      </div>
      <div className="">
        <input
          type="text"
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
          placeholder={
            isRegister
              ? Locale.Login.RegisterPhonePlaceholder
              : Locale.Login.UserNamePlaceholder
          }
        />
      </div>
      {isRegister ? (
        <div className={styles["verify_code"]}>
          <input type="text" placeholder={Locale.Login.RegisterPlaceholder} />
          <IconButton
            className={styles["get_code"]}
            text={Locale.Login.GetCode}
          />
        </div>
      ) : (
        <div></div>
      )}
      <div className={styles["input"]}>
        <input
          type={showPassword ? "text" : "password"}
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          placeholder={Locale.Login.PasswordPlaceholder}
        />
        <EyeButton showPassword={showPassword} />
      </div>
      <div>
        {loginFail ? (
          <div className={styles["login-fail"]}>
            登录失败，请检查你的账号和密码
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <div>
        {loginSuccess ? (
          <div className={styles["login-success"]}>登录成功！</div>
        ) : (
          <div></div>
        )}
      </div>

      <div className={styles["actions"]}>
        <IconButton
          className={styles["register-btn"]}
          text={isRegister ? Locale.Login.Login : Locale.Login.Register}
          bordered
          onClick={() => setIsRegister(!isRegister)}
          shadow
        />

        <IconButton
          className={styles["login-btn"]}
          text={isRegister ? Locale.Login.RegisterConfirm : Locale.Login.Done}
          onClick={async () => {
            setLoginFail(false);
            setLoginSuccess(false);
            if (isRegister) {
              // startChat();
            } else {
              var data = await login(loginName, loginPassword);
              console.log(data);
              if (data.success) {
                updateToken(data.data);
                setLoginSuccess(true);
                setLoginFail(false);
              } else {
                // updateToken("");
                setLoginFail(true);
                setLoginSuccess(false);
              }
            }
          }}
          type="primary"
          shadow
        />
      </div>
    </div>
  );
}
