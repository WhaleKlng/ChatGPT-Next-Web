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
import { useAppConfig, useChatStore } from "../store";
import { MaskAvatar } from "./mask";
import { useCommand } from "../command";

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

  return (
    <div className={styles["new-chat"]}>
      <div className={styles["title"]}>{Locale.Login.Title}</div>
      <div className={styles["sub-title"]}>{Locale.Login.SubTitle}</div>

      <div className="">
        <input type="text" placeholder={Locale.Login.UserNamePlaceholder} />
      </div>
      <div className={styles["input"]}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder={Locale.Login.PasswordPlaceholder}
        />
        <EyeButton showPassword={showPassword} />
      </div>

      <div className={styles["actions"]}>
        <IconButton
          className={styles["register-btn"]}
          text={Locale.Login.Register}
          //   onClick={() => navigate(Path.Masks)}
          bordered
          shadow
        />

        <IconButton
          className={styles["login-btn"]}
          text={Locale.Login.Done}
          //   onClick={() => startChat()}
          type="primary"
          shadow
        />
      </div>
    </div>
  );
}
