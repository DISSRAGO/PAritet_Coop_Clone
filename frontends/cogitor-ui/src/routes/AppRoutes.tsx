import React from "react";
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import MainLayout from "../layout/MainLayout/MainLayout";

import { AuthContextProvider } from "../context/AuthContext";
import { ROUTE_NAMES } from "./AppRoutesSettings";

import Editor from "../pages/EditorPage/EditorPage.jsx";
import Viewer from "../pages/ViewerPage/ViewerPage.jsx";
import StoryPage from "../pages/ThankaStory/ThankaStory.jsx";
import CommentPage from "../pages/CommentPage/CommentPage.jsx";
import AdminPage from "../pages/Admin/Admin.jsx";

const SignUpPage = React.lazy(() => import("../pages/SignUpPage"));
const ConfirmSignUp = React.lazy(() => import('../pages/ConfirmSignUp'));
const BillingPage = React.lazy(() => import("../pages/BillingPage"));
const SignInPage = React.lazy(() => import("../pages/SignInPage"));

const AppRoutes: React.FC = () => {
    return (
        <>
        <BrowserRouter>
            <AuthContextProvider>
                <MainLayout>
                    <Routes>
                        <Route path={ROUTE_NAMES.HOME_PAGE} element={
                            <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                <Viewer />
                            </React.Suspense>
                        } />
                        <Route path={ROUTE_NAMES.NAVIGATOR} element={
                            <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                <Viewer />
                            </React.Suspense>
                        } />
                        <Route path={ROUTE_NAMES.EMPTY_NAVIGATOR} element={
                            <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                <Viewer />
                            </React.Suspense>
                        } />
                        <Route
                            path={ROUTE_NAMES.PROFILE}
                            element={
                                <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                    <Viewer />
                                </React.Suspense>
                            }
                        />
                         <Route path={ROUTE_NAMES.SITE_PAGE} element={
                            <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                <Viewer />
                            </React.Suspense>
                        } />
                        <Route
                            path={ROUTE_NAMES.STORY_PAGE}
                            element={
                                <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                    <StoryPage />
                                </React.Suspense>
                            }
                        />
                         <Route
                            path={ROUTE_NAMES.COMMENTS_PAGE}
                            element={
                                <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                    <CommentPage />
                                </React.Suspense>
                            }
                        />
                        <Route
                            path={ROUTE_NAMES.ADMIN}
                            element={
                                <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                    <AdminPage />
                                </React.Suspense>
                            } />
                        <Route
                            path='*'
                            element={
                                <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                    <Viewer />
                                </React.Suspense>
                            } />
                        <Route
                            path={ROUTE_NAMES.BILLING}
                            element={
                                <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                    <BillingPage />
                                </React.Suspense>
                            }
                        />
                        <Route path={ROUTE_NAMES.SIGN_IN_PAGE} element={
                            <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                <SignInPage />
                            </React.Suspense>
                        } />
                        <Route
                            path={ROUTE_NAMES.SIGN_UP}
                            element={
                                <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                    <SignUpPage />
                                </React.Suspense>
                            }
                        />
                        <Route
                            path={ROUTE_NAMES.CONFIRM_PAGE}
                            element={
                                <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                    <ConfirmSignUp />
                                </React.Suspense>
                            }
                        />
                        <Route
                            path={ROUTE_NAMES.CREATE_PAGE}
                            element={
                                <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                    <Editor type={'create'} />
                                </React.Suspense>
                            }
                        />
                        <Route
                            path={ROUTE_NAMES.CREATE_SITE}
                            element={
                                <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                    <Editor type={'createsite'} />
                                </React.Suspense>
                            }
                        />
                        <Route
                            path={ROUTE_NAMES.EDIT_SITE}
                            element={
                                <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                    <Editor type={'editsite'} />
                                </React.Suspense>
                            }
                        />
                        <Route
                            path={ROUTE_NAMES.EDIT_PAGE}
                            element={
                                <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                    <Editor type={'edit'} />
                                </React.Suspense>
                            } />
                        <Route
                            path={ROUTE_NAMES.ADD_PAGE}
                            element={
                                <React.Suspense fallback={<div className="error">Загрузка...</div>}>
                                    <Editor type={'add'} />
                                </React.Suspense>
                            } />
                    </Routes>
                </MainLayout>
            </AuthContextProvider>
        </BrowserRouter>
        </>
    );
};

export default AppRoutes;
