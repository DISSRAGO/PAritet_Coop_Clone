import { Dispatch } from "react";

import AuthService from "../../api/AuthService";
import { IConfirmFormData } from "../../models/profile/IConfirmFormData";
import { IRegistrationFormData } from "../../models/profile/IRegisterFormData";
import { AppDispatch } from "../index";
import { AuthActionEnum } from "../types/auth-types";

const extractErrorMessage = async (error: any, fallback: string): Promise<string> => {
        if (error && typeof error.json === "function") {
                try {
                        const e = await error.json();
                        return e?.message || e?.text || fallback;
                } catch (_) {
                        return fallback;
                }
        }

        return error?.message || fallback;
};

export const AuthActionCreators = {
        login:
                (login: string, password: string): Dispatch<AppDispatch> =>
                async (dispatch: AppDispatch) => {
                        dispatch({ type: AuthActionEnum.LOGIN_REQUEST });

                        AuthService.signIn(login, password)
                                .then((data) => {
                                        localStorage.setItem("accessToken", data.accessToken);
                                        localStorage.setItem("refreshToken", data.refreshToken);
                                        dispatch({
                                                type: AuthActionEnum.LOGIN_SUCCESS,
                                        });
                                })
                                .catch(async (error) => {
                                        const message = await extractErrorMessage(
                                                error,
                                                "Ошибка авторизации"
                                        );

                                        dispatch({
                                                type: AuthActionEnum.LOGIN_FAILURE,
                                                payload: message,
                                        });
                                });
                },

        signUp:
                (registrationFormData: IRegistrationFormData): Dispatch<AppDispatch> =>
                async (dispatch: AppDispatch) => {
                        dispatch({ type: AuthActionEnum.SIGN_UP_REQUEST });

                        AuthService.signUp(registrationFormData)
                                .then((data) => {
                                        dispatch({
                                                type: AuthActionEnum.SIGN_UP_SUCCESS,
                                                payload: data,
                                        });
                                })
                                .catch(async (error) => {
                                        const message = await extractErrorMessage(
                                                error,
                                                "Ошибка регистрации"
                                        );

                                        dispatch({
                                                type: AuthActionEnum.SIGN_UP_FAILURE,
                                                payload: message,
                                        });
                                });
                },

        confirmSignUp:
                (formData: IConfirmFormData): Dispatch<AppDispatch> =>
                async (dispatch: AppDispatch) => {
                        dispatch({ type: AuthActionEnum.CONFIRM_SIGN_UP_REQUEST });

                        AuthService.signUpConfirm(formData)
                                .then(() => {
                                        dispatch({
                                                type: AuthActionEnum.CONFIRM_SIGN_UP_SUCCESS,
                                        });
                                })
                                .catch(async (error) => {
                                        const message = await extractErrorMessage(
                                                error,
                                                "Ошибка подтверждения регистрации"
                                        );

                                        dispatch({
                                                type: AuthActionEnum.CONFIRM_SIGN_UP_FAILURE,
                                                payload: message,
                                        });
                                });
                },

        logout: (): Dispatch<AppDispatch> => async (dispatch: AppDispatch) => {
                dispatch({ type: AuthActionEnum.LOGOUT_REQUEST });

                AuthService.logout()
                        .then(() => {
                                dispatch({
                                        type: AuthActionEnum.LOGOUT_SUCCESS,
                                });
                        })
                        .catch(async (error) => {
                                const message = await extractErrorMessage(
                                        error,
                                        "Ошибка выхода"
                                );

                                dispatch({
                                        type: AuthActionEnum.LOGOUT_FAILURE,
                                        payload: message,
                                });
                        });
        },

        validateEmail:
                (email: string): Dispatch<AppDispatch> =>
                async (dispatch: AppDispatch) => {
                        dispatch({ type: AuthActionEnum.VALIDATE_EMAIL_REQUEST });

                        AuthService.validateEmail(email)
                                .then(() => {
                                        dispatch({
                                                type: AuthActionEnum.VALIDATE_EMAIL_SUCCESS,
                                        });
                                })
                                .catch(async (error) => {
                                        const message = await extractErrorMessage(
                                                error,
                                                "Ошибка проверки email"
                                        );

                                        dispatch({
                                                type: AuthActionEnum.VALIDATE_EMAIL_FAILURE,
                                                payload: message,
                                        });
                                });
                },

        validateLogin:
                (login: string): Dispatch<AppDispatch> =>
                async (dispatch: AppDispatch) => {
                        dispatch({ type: AuthActionEnum.VALIDATE_LOGIN_REQUEST });

                        AuthService.validateLogin(login)
                                .then(() => {
                                        dispatch({
                                                type: AuthActionEnum.VALIDATE_LOGIN_SUCCESS,
                                        });
                                })
                                .catch(async (error) => {
                                        const message = await extractErrorMessage(
                                                error,
                                                "Ошибка проверки логина"
                                        );

                                        dispatch({
                                                type: AuthActionEnum.VALIDATE_LOGIN_FAILURE,
                                                payload: message,
                                        });
                                });
                },

        validatePhone:
                (phone: string): Dispatch<AppDispatch> =>
                async (dispatch: AppDispatch) => {
                        dispatch({ type: AuthActionEnum.VALIDATE_PHONE_REQUEST });

                        AuthService.validatePhone(phone)
                                .then(() => {
                                        dispatch({
                                                type: AuthActionEnum.VALIDATE_PHONE_SUCCESS,
                                        });
                                })
                                .catch(async (error) => {
                                        const message = await extractErrorMessage(
                                                error,
                                                "Ошибка проверки телефона"
                                        );

                                        dispatch({
                                                type: AuthActionEnum.VALIDATE_PHONE_FAILURE,
                                                payload: message,
                                        });
                                });
                },
};