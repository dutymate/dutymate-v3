import Constants from "expo-constants";
import { useFonts } from "expo-font";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";

import React, { useEffect } from "react";
import { BackHandler } from "react-native";
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { initializeKakaoSDK } from "@react-native-kakao/core";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
	createNavigationContainerRef,
	NavigationContainer,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { CreateWardScreen } from "@/screens/CreateWardScreen";
import { ErrorScreen } from "@/screens/ErrorScreen";
import { ExtraInfoScreen } from "@/screens/ExtraInfoScreen";
import { LandingScreen } from "@/screens/LandingScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { PasswordResetScreen } from "@/screens/PasswordResetScreen";
import { SignupScreen } from "@/screens/SignupScreen";
import { WebViewScreen } from "@/screens/WebViewScreen";
import { useUserAuthStore } from "@/store/userAuthStore";
import { navigateBasedOnUserRole } from "@/utils/navigation";

// 네비게이션 타입 정의
type RootStackParamList = {
	CreateWard: undefined;
	Error: undefined;
	ExtraInfo: undefined;
	Landing: undefined;
	Login: undefined;
	PasswordReset: undefined;
	Signup: undefined;
	WebView: { path?: string; inviteToken?: string };
};

configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false,
});

const Stack = createStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

// 초기 화면 이동 함수
const navigateToScreenAfterLogin = (userInfo: any) => {
	if (!navigationRef.isReady()) return;

	// 공통 네비게이션 로직 사용
	navigateBasedOnUserRole(navigationRef, userInfo);
};

/**
 * 앱의 메인 컴포넌트입니다.
 * 이 컴포넌트는 React Navigation을 사용하여 앱의 내비게이션을 설정합니다.
 */
export default function App() {
	const { setUserInfo } = useUserAuthStore();

	/**
	 * 카카오 네이티브 앱 키 초기화
	 */
	const kakaoNativeAppKey = Constants.expoConfig?.extra?.kakaoNativeAppKey;

	useEffect(() => {
		initializeKakaoSDK(kakaoNativeAppKey);
	}, []);

	/**
	 * 구글 로그인 초기화
	 */
	const googleIosClientId = Constants.expoConfig?.extra?.googleIosClientId;
	const googleWebClientId = Constants.expoConfig?.extra?.googleWebClientId;

	useEffect(() => {
		GoogleSignin.configure({
			iosClientId: googleIosClientId,
			webClientId: googleWebClientId,
			offlineAccess: true,
		});
	}, []);

	/**
	 * 폰트(PretendardVariable) 로드
	 */
	const [fontsLoaded] = useFonts({
		PretendardVariable: require("../assets/fonts/PretendardVariable.ttf"),
	});

	/**
	 * 컴포넌트 마운트 시 뒤로가기 리스너를 등록하고, 언마운트 시 해제합니다.
	 */
	useEffect(() => {
		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			() => {
				if (navigationRef.isReady() && navigationRef.canGoBack()) {
					navigationRef.goBack();
					return true;
				}
				return false;
			},
		);
		return () => backHandler.remove();
	}, []);

	/**
	 * 자동 로그인 체크
	 */
	useEffect(() => {
		const checkToken = async () => {
			// 디버깅 시에만 주석 해제하여 로그아웃 강제 실행
			// await SecureStore.deleteItemAsync("auth-token");
			// await SecureStore.deleteItemAsync("user-info");

			try {
				const token = await SecureStore.getItemAsync("auth-token");
				const userInfoString = await SecureStore.getItemAsync("user-info");

				if (token && userInfoString) {
					const userInfo = JSON.parse(userInfoString);

					// userAuthStore에 사용자 정보 설정
					setUserInfo({
						...userInfo,
						token,
					});

					navigateToScreenAfterLogin(userInfo);
				}
			} catch (error) {
				console.error("자동 로그인 확인 중 오류 발생:", error);
				// 오류 발생 시 토큰 삭제 및 로그아웃
				await useUserAuthStore.getState().logout();
			}
		};

		// 폰트 로드 후 토큰 체크
		if (fontsLoaded) {
			checkToken();
		}
	}, [fontsLoaded, setUserInfo]);

	if (!fontsLoaded) {
		return null;
	}

	return (
		<>
			<StatusBar style="auto" />
			<NavigationContainer ref={navigationRef}>
				<Stack.Navigator
					initialRouteName={"Landing"}
					screenOptions={{ headerShown: false }}
				>
					<Stack.Screen name={"CreateWard"} component={CreateWardScreen} />
					<Stack.Screen name={"Error"} component={ErrorScreen} />
					<Stack.Screen name={"ExtraInfo"} component={ExtraInfoScreen} />
					<Stack.Screen name={"Landing"} component={LandingScreen} />
					<Stack.Screen name={"Login"} component={LoginScreen} />
					<Stack.Screen
						name={"PasswordReset"}
						component={PasswordResetScreen}
					/>
					<Stack.Screen name={"Signup"} component={SignupScreen} />
					<Stack.Screen name={"WebView"} component={WebViewScreen} />
				</Stack.Navigator>
			</NavigationContainer>

			{/* Toast 컴포넌트를 최하단에 추가 */}
			<Toast />
		</>
	);
}
