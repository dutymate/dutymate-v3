import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

import { userService } from "@/api/services/userService";

export const useEmailVerification = (mode: "login" | "signup" | "reset") => {
	const [email, setEmail] = useState("");
	const [authCode, setAuthCode] = useState("");
	const [authCodeSent, setAuthCodeSent] = useState(false);
	const [authCodeStatus, setAuthCodeStatus] = useState<
		"idle" | "success" | "error"
	>("idle");
	const [isVerified, setIsVerified] = useState(false);
	const [timer, setTimer] = useState(300);
	const [authCodeExpired, setAuthCodeExpired] = useState(false);
	const [emailError, setEmailError] = useState<string | undefined>(undefined);
	const [isSending, setIsSending] = useState(false);

	useEffect(() => {
		if (!authCodeSent || timer <= 0) return;

		const startTime = Date.now();
		const expectedEndTime = startTime + timer * 1000;

		const interval = setInterval(() => {
			const currentTime = Date.now();
			const remainingTime = Math.max(
				0,
				Math.ceil((expectedEndTime - currentTime) / 1000),
			);

			setTimer(remainingTime);

			if (remainingTime <= 0) {
				clearInterval(interval);
				setAuthCodeExpired(true);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [authCodeSent, timer]);

	const validateEmail = (email: string) =>
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

	const sendCode = async () => {
		if (!validateEmail(email.trim())) {
			setEmailError("올바른 이메일 형식이 아닙니다.");
			setTimeout(() => setEmailError(undefined), 3000);
			return;
		}

		try {
			setAuthCode("");
			setAuthCodeStatus("idle");
			setIsVerified(false);
			setIsSending(true);

			await userService.sendEmailAuthCode(email.trim(), mode);
			setAuthCodeSent(true);
			setTimer(300);
			setAuthCodeExpired(false);
			Toast.show({
				type: "success",
				text1: "인증번호가 발송되었습니다.",
			});
		} catch (err: any) {
			Toast.show({
				type: "error",
				text1: err?.message || "인증번호 발송 실패",
			});
		} finally {
			setIsSending(false);
		}
	};

	const verifyCode = async () => {
		if (authCodeExpired) {
			Toast.show({
				type: "error",
				text1: "인증 코드가 만료되었습니다.",
			});
			return;
		}

		try {
			const res = await userService.verifyEmailCode({
				email: email.trim(),
				code: authCode.trim(),
			});

			if (res.status === 200) {
				setAuthCodeStatus("success");
				setIsVerified(true);
				setTimer(0);
			} else {
				throw new Error();
			}
		} catch (err) {
			setAuthCodeStatus("error");
			setIsVerified(false);
			setAuthCode("");
		}
	};

	const resetVerification = () => {
		setAuthCode("");
		setAuthCodeStatus("idle");
		setAuthCodeSent(false);
		setIsVerified(false);
		setTimer(300);
		setAuthCodeExpired(false);
	};

	return {
		email,
		setEmail,
		authCode,
		setAuthCode,
		authCodeSent,
		authCodeStatus,
		isVerified,
		timer,
		authCodeExpired,
		emailError,
		isSending,
		sendCode,
		verifyCode,
		resetVerification,
	};
};
