import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import styles from "./sign-in.module.scss";
import { IconButton } from "@/app/components/button";
import { CloseIcon } from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import { useAccessStore } from "@/app/store";
import { showToast } from "./ui-lib";

export function SignIn(props: {
  showSignIn: boolean;
  setShowSignIn: Dispatch<SetStateAction<boolean>>;
}) {
  const { showSignIn, setShowSignIn } = props;
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  // 防止表单重复 提交
  const [submitting, setSubmitting] = useState(false);
  const [updateToken] = useAccessStore((state) => [state.updateToken]);

  const handleLogin = async (e: FormEvent) => {
    if (phone === "17816123572") {
      updateToken("jwt_token");
    }
  };
  const handleSendVerification = async (e: FormEvent) => {};
  const handleRegister = async (e: FormEvent) => {
    console.log("注册");
  };

  return (
    <div
      className={styles["login-form-container"]}
      style={{ display: showSignIn ? "" : "none" }}
    >
      <form
        className={styles["login-form"]}
        onSubmit={isRegister ? handleRegister : handleLogin}
      >
        <IconButton
          icon={<CloseIcon />}
          className={styles["sidebar-bar-button"]}
          onClick={() => setShowSignIn(!showSignIn)}
          shadow
        />
        <h2 className={styles["login-form-title"]}>
          {isRegister ? "注册" : "登录"}
        </h2>
        <div className={styles["login-form-input-group"]}>
          <label htmlFor="phone">手机号</label>
          <input
            type="phone"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className={styles["login-form-input-group"]}>
          <label htmlFor="password">密码</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {isRegister ? (
          <div className={styles["login-form-input-group"]}>
            <label htmlFor="verification-code">验证码</label>
            <div className={styles["verification-code-container"]}>
              <input
                type="text"
                id="verification-code"
                maxLength={6}
                pattern="\d{6}"
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <button
                className={styles["send-verification-button"]}
                onClick={handleSendVerification}
                disabled={isSending}
              >
                {isSending ? "已发送至手机" : "获取验证码"}
              </button>
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className={styles["button-container"]}>
          <button
            className={styles["login-form-submit"]}
            type="submit"
            disabled={submitting}
          >
            {isRegister ? "注册" : "登录"}
          </button>
        </div>
        <p className={styles["change-text"]}>
          {isRegister ? "已经有账号啦? " : "还没有账号? "}
          <button
            className={styles["button"]}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "去登录" : "去注册"}
          </button>
        </p>
      </form>
    </div>
  );
}
