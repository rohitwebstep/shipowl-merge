"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DropshipperMiddleWareProvider from "./middleware/DropshipperMiddleWareContext";
import { DropshipperProfileProvider } from "./dropshipper/update/DropshipperProfileContext";
import { ProfileProvider } from "../admin/supplier/ProfileContext";
import { HashLoader } from "react-spinners";
import { ImageURLProvider } from "../ImageURLContext";

function LayoutWrapperInner({ children }) {
    const pathname = usePathname();
    const normalizedPath = pathname.endsWith('/') && pathname !== '/'
        ? pathname.slice(0, -1)
        : pathname;

    const authPages = [
        '/dropshipping/shopify/success',
        '/dropshipping/shopify/connecting',
        '/dropshipping/shopify/failed',
        '/dropshipping/auth/login',
        '/dropshipping/auth/password/forget',
        '/dropshipping/auth/password/reset',
        '/dropshipping/auth/register',
        '/dropshipping/auth/register/verify'
    ];

    const isAuthPage = authPages.includes(normalizedPath);

    return (
        <div className="main">
            <div className="container">
                <div className={`${!isAuthPage ? "lg:flex" : ""} `}>
                    {!isAuthPage && (
                        <div className="xl:w-[18.5%] lg:w-[23%] w-full p-2 leftbar">
                            <Sidebar />
                        </div>
                    )}
                    <ImageURLProvider>
                        <DropshipperMiddleWareProvider>
                            <div className={`px-3 mt-20 lg:mt-0  lg-px-0 ${isAuthPage ? "w-full" : "main-outlet xl:w-[81.5%] lg:w-[73%]"}`}>
                                {!isAuthPage && <Header />}
                                <div className="md:p-7 xl:p-3 md:pt-0">
                                    <ProfileProvider>
                                        <DropshipperProfileProvider>
                                            {children}
                                        </DropshipperProfileProvider>
                                    </ProfileProvider>
                                </div>
                            </div>
                        </DropshipperMiddleWareProvider>
                    </ImageURLProvider>
                </div>
            </div>
        </div>
    );
}

export default function LayoutWrapper({ children }) {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-96">
            <HashLoader color="orange" />
        </div>}>
            <LayoutWrapperInner>{children}</LayoutWrapperInner>
        </Suspense>
    );
}
